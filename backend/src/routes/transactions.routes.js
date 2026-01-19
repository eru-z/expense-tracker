import express from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";


const router = express.Router();

// Get user's transactions
router.get("/", auth, async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM transactions WHERE user_id=$1 ORDER BY occurred_at DESC",
      [req.user.id]
    );

    res.json({ transactions: rows });
  } catch (err) {
    next(err);
  }
});

// Create transaction
router.post("/", auth, async (req, res, next) => {
  try {
    const { amount, category_id, note, type } = req.body;

    if (!amount || !type) {
      return res.status(400).json({ error: "Missing amount or type" });
    }

    const { rows } = await pool.query(
      `INSERT INTO transactions(user_id, amount, category_id, note, type, occurred_at)
       VALUES ($1,$2,$3,$4,$5,now()) RETURNING *`,
      [req.user.id, amount, category_id || null, note || "", type]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
