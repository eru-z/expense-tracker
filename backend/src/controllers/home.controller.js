import pool from "../db.js";

export async function getHome(req, res) {
  const userId = req.user.id;

  const balance = await pool.query(
    "SELECT COALESCE(SUM(balance),0) FROM wallets WHERE user_id=$1",
    [userId]
  );

  const transactions = await pool.query(`
    SELECT * FROM transactions 
    WHERE wallet_id IN (SELECT id FROM wallets WHERE user_id=$1)
    ORDER BY created_at DESC LIMIT 5
  `, [userId]);

  const budgets = await pool.query(
    "SELECT * FROM budgets WHERE user_id=$1",
    [userId]
  );

  res.json({
    balance: balance.rows[0].coalesce,
    transactions: transactions.rows,
    budgets: budgets.rows,
  });
}
