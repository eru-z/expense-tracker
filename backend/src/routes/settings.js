import express from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const ALLOWED_CURRENCIES = ["EUR", "USD", "GBP", "CHF", "MKD"];

/* ======================
   GET SETTINGS
====================== */
router.get("/", auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `
      SELECT
        notifications,
        carry_over AS "carryOver",
        ai_tips    AS "aiTips",
        currency,
        dark_mode  AS "darkMode"
      FROM user_settings
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    // Auto-create settings row on first access
    if (!rows.length) {
      const created = await pool.query(
        `
        INSERT INTO user_settings (user_id)
        VALUES ($1)
        RETURNING
          notifications,
          carry_over AS "carryOver",
          ai_tips    AS "aiTips",
          currency,
          dark_mode  AS "darkMode"
        `,
        [req.user.id]
      );

      return res.json(created.rows[0]);
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/* ======================
   UPDATE SETTINGS
====================== */
router.put("/", auth, async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Empty request body" });
    }

    const {
      notifications,
      carryOver,
      aiTips,
      currency,
      darkMode,
    } = req.body;

    // Validate currency if provided
    if (currency && !ALLOWED_CURRENCIES.includes(currency)) {
      return res.status(400).json({ message: "Invalid currency" });
    }

    // Ensure settings row exists (idempotent)
    await pool.query(
      `
      INSERT INTO user_settings (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO NOTHING
      `,
      [req.user.id]
    );

    const { rows } = await pool.query(
      `
      UPDATE user_settings SET
        notifications = COALESCE($1, notifications),
        carry_over    = COALESCE($2, carry_over),
        ai_tips       = COALESCE($3, ai_tips),
        currency      = COALESCE($4, currency),
        dark_mode     = COALESCE($5, dark_mode),
        updated_at    = NOW()
      WHERE user_id = $6
      RETURNING
        notifications,
        carry_over AS "carryOver",
        ai_tips    AS "aiTips",
        currency,
        dark_mode  AS "darkMode"
      `,
      [
        notifications ?? null,
        carryOver ?? null,
        aiTips ?? null,
        currency ?? null,
        darkMode ?? null,
        req.user.id,
      ]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
