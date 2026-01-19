import express from "express";
import bcrypt from "bcrypt";
import auth from "../middleware/auth.js";
import pool from "../db.js";

const router = express.Router();

/**
 * UPDATE PROFILE + CHANGE PASSWORD
 * PUT /api/account/profile
 */
router.put("/profile", auth, async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // 🔎 Load user (UUID-safe)
    const userRes = await pool.query(
      "SELECT id, password_hash FROM users WHERE id = $1",
      [req.user.id]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = userRes.rows[0];

    // 🔐 Password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password required",
        });
      }

      await pool.query(
  "DELETE FROM refresh_tokens WHERE user_id = $1",
  [req.user.id]
);

      const valid = await bcrypt.compare(
        currentPassword,
        user.password_hash
      );

      if (!valid) {
        return res.status(400).json({
          message: "Current password is incorrect",
        });
      }

      const hashed = await bcrypt.hash(newPassword, 10);

      await pool.query(
        `
        UPDATE users
        SET email = $1,
            name = $2,
            password_hash = $3
        WHERE id = $4
        `,
        [email, name ?? "", hashed, req.user.id]
      );
    } else {
      // 📝 Profile only
      await pool.query(
        `
        UPDATE users
        SET email = $1,
            name = $2
        WHERE id = $3
        `,
        [email, name ?? "", req.user.id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("PROFILE UPDATE ERROR:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;
