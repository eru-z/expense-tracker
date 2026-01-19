import express from "express";
import db from "../db.js";
const router = express.Router();

router.get("/home-intelligence", async (req, res) => {
  const { rows } = await db.query(
    "SELECT amount, category, merchant, created_at FROM transactions WHERE user_id = $1",
    [req.user.id]
  );

  const now = Date.now();
  const last7 = rows.filter(t => new Date(t.created_at) > now - 7 * 864e5);
  const prev7 = rows.filter(
    t => new Date(t.created_at) < now - 7 * 864e5 && new Date(t.created_at) > now - 14 * 864e5
  );

  const sum = arr => arr.reduce((a, b) => a + Math.abs(b.amount), 0);

  const weeklySpend = sum(last7);
  const prevWeeklySpend = sum(prev7);
  const velocity = weeklySpend / 7;
  const change = ((weeklySpend - prevWeeklySpend) / (prevWeeklySpend || 1)) * 100;

  const merchants = last7.reduce((a, t) => {
    a[t.merchant] = (a[t.merchant] || 0) + Math.abs(t.amount);
    return a;
  }, {});

  const topMerchant = Object.entries(merchants).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  res.json({
    weeklySpend,
    change,
    velocity,
    topMerchant,
    anomaly: change > 50,
    forecastDays: velocity ? Math.round((1000 - weeklySpend) / velocity) : null,
  });
});

export default router;
