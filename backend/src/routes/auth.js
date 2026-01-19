import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

/* ======================
   JWT SECRETS (SINGLE SOURCE)
====================== */
const ACCESS_SECRET = process.env.JWT_SECRET || "dev-access-secret";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

/* ======================
   REGISTER
====================== */
router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name
      `,
      [email.toLowerCase(), hash, name ?? ""]
    );

    const accessToken = jwt.sign(
      { id: result.rows[0].id },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: result.rows[0].id },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await pool.query(
      `
      INSERT INTO refresh_tokens (user_id, token)
      VALUES ($1, $2)
      `,
      [result.rows[0].id, refreshToken]
    );

    res.json({
      token: accessToken,
      refreshToken,
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already registered" });
    }
    next(err);
  }
});

/* ======================
   LOGIN
====================== */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `
      SELECT id, password_hash
      FROM users
      WHERE email = $1
      `,
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);

    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user.id },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await pool.query(
      `
      INSERT INTO refresh_tokens (user_id, token)
      VALUES ($1, $2)
      `,
      [user.id, refreshToken]
    );

    res.json({
      token: accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
});

/* ======================
   REFRESH TOKEN
====================== */
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Missing refresh token" });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const result = await pool.query(
      `
      SELECT 1
      FROM refresh_tokens
      WHERE token = $1
      `,
      [refreshToken]
    );

    if (!result.rowCount) {
      return res.status(401).json({ error: "Refresh token revoked" });
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

/* ======================
   LOGOUT
====================== */
router.post("/logout", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.json({ success: true });
    }

    await pool.query(
      `
      DELETE FROM refresh_tokens
      WHERE token = $1
      `,
      [refreshToken]
    );

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
