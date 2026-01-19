import db from "../db.js";

export async function getHomeData(userId) {
  const [summary] = await db.query(`
    SELECT 
      COALESCE(SUM(amount),0) AS balance,
      COUNT(*) AS tx_count
    FROM transactions WHERE user_id=$1
  `,[userId]);

  const tx = await db.query(`
    SELECT id,title,category,amount,created_at
    FROM transactions
    WHERE user_id=$1
    ORDER BY created_at DESC LIMIT 10
  `,[userId]);

  const budgets = await db.query(`
    SELECT category, used, limit FROM budgets WHERE user_id=$1
  `,[userId]);

  const goals = await db.query(`
    SELECT name, saved, target FROM goals WHERE user_id=$1
  `,[userId]);

  return {
    summary: summary.rows[0],
    transactions: tx.rows,
    budgets: budgets.rows,
    goals: goals.rows,
  };
}
