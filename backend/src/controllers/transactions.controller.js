import pool from "../db.js";

export async function listTransactions(req, res) {
  const userId = req.user.id;

  const tx = await pool.query(`
    SELECT * FROM transactions
    WHERE wallet_id IN (SELECT id FROM wallets WHERE user_id=$1)
    ORDER BY created_at DESC
  `, [userId]);

  res.json(tx.rows);
}
