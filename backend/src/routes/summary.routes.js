import express from "express";
import { auth } from "../middleware.js";
import pool from "../db.js";

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const period = req.query.period || "month";

  const result = await pool.query(
    `
    SELECT COALESCE(SUM(amount),0) AS total
    FROM transactions
    WHERE user_id = $1
    `,
    [req.user.id]
  );

  res.json({ total: result.rows[0].total });
});

export default router;
