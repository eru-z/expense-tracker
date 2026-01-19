import express from "express";
import db from "./db.js";
import auth from "./middleware.js";

const router = express.Router();

router.get("/categories", auth, async (req, res) => {
  const userId = req.user.id;

  const { rows } = await db.query(
    `SELECT c.name, COALESCE(SUM(t.amount),0) AS total
     FROM categories c
     LEFT JOIN transactions t 
       ON t.category_id=c.id AND t.type='expense'
     WHERE c.user_id=$1
     GROUP BY c.name`,
    [userId]
  );

  res.json(rows);
});

router.get("/monthly", auth, async (req, res) => {
  const userId = req.user.id;

  const { rows } = await db.query(
    `SELECT DATE_TRUNC('month', created_at) AS month,
            SUM(CASE WHEN type='income' THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     WHERE user_id=$1
     GROUP BY month
     ORDER BY month DESC
     LIMIT 6`,
    [userId]
  );

  res.json(rows);
});

router.get("/health", auth, async (req, res) => {
  const userId = req.user.id;

  const { rows } = await db.query(
    `SELECT 
      COALESCE(SUM(CASE WHEN type='income' THEN amount END),0) AS income,
      COALESCE(SUM(CASE WHEN type='expense' THEN amount END),0) AS expense
     FROM transactions
     WHERE user_id=$1`,
    [userId]
  );

  const income = Number(rows[0].income);
  const expense = Number(rows[0].expense);

  let score = 100;
  if (expense > income) score -= 20;
  if (income - expense < 0) score -= 30;

  res.json({ score });
});

export default router;
