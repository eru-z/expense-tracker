export default function formatCurrency(amount, currency = "EUR") {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return `${currency} 0.00`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Fallback if Intl fails (rare Android edge case)
    return `${currency} ${value.toFixed(2)}`;
  }
}
