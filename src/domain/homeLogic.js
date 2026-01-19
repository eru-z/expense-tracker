export function computePulse({ summary, budgets, goals }) {
  let score = 100;
  budgets.forEach(b => b.used > b.limit && (score -= 20));
  if (summary.balance < 0) score -= 25;
  if (goals.every(g => g.saved >= g.target)) score += 10;
  return Math.max(0, Math.min(score, 100));
}

export function generateInsight(data) {
  const overspent = data.budgets.find(b => b.used > b.limit);
  if (overspent) return `You exceeded ${overspent.category} by $${overspent.used - overspent.limit}`;

  const bigTx = data.transactions.find(t => t.amount < -200);
  if (bigTx) return `Large expense: ${bigTx.title} ($${Math.abs(bigTx.amount)})`;

  return "You're financially healthy this week 🎉";
}
