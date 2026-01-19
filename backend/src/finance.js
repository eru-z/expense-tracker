import express from "express";
import db from "./db.js";
import auth from "./middleware.js";

const router = express.Router();

router.get("/summary", auth, async (req, res) => {
  const userId = req.user.id;

  const { rows: incomeRows } = await db.query(
    "SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE user_id=$1 AND type='income'",
    [userId]
  );
  const { rows: expenseRows } = await db.query(
    "SELECT COALESCE(SUM(amount),0) AS total FROM transactions WHERE user_id=$1 AND type='expense'",
    [userId]
  );

  const income = Number(incomeRows[0].total);
  const expense = Number(expenseRows[0].total);

  res.json({
    balance: income - expense,
    income,
    expense,
  });
});

router.get("/recent", auth, async (req, res) => {
  const userId = req.user.id;

  const { rows } = await db.query(
    `SELECT t.*, c.name AS category 
     FROM transactions t 
     LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.user_id=$1 
     ORDER BY t.created_at DESC 
     LIMIT 5`,
    [userId]
  );

  res.json(rows);
});

router.get("/budgets", auth, async (req, res) => {
  const userId = req.user.id;

  const { rows } = await db.query(
    `SELECT b.id, c.name AS category, b.amount,
       COALESCE(SUM(t.amount),0) AS spent
     FROM budgets b
     JOIN categories c ON b.category_id = c.id
     LEFT JOIN transactions t 
       ON t.category_id = b.category_id 
      AND t.user_id = b.user_id 
      AND t.type='expense'
     WHERE b.user_id=$1
     GROUP BY b.id, c.name, b.amount`,
    [userId]
  );

  const formatted = rows.map(b => ({
    ...b,
    percent: Math.round((Number(b.spent) / Number(b.amount)) * 100),
  }));

  res.json(formatted);
});

router.post("/transaction", auth, async (req, res) => {
  const { amount, type, category_id, description } = req.body;
  const userId = req.user.id;

  const { rows } = await db.query(
    `INSERT INTO transactions (user_id, amount, type, category_id, description)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [userId, amount, type, category_id, description]
  );

  res.json(rows[0]);
});

export default router;
