// src/utils/Currency.js

let currentCurrency = {
  code: "EUR",
  locale: "de-DE",
};

export const setCurrency = (code) => {
  switch (code) {
    case "USD":
      currentCurrency = { code: "USD", locale: "en-US" };
      break;
    case "CHF":
      currentCurrency = { code: "CHF", locale: "de-CH" };
      break;
    case "MKD":
      currentCurrency = { code: "MKD", locale: "mk-MK" };
      break;
    default:
      currentCurrency = { code: "EUR", locale: "de-DE" };
  }
};

export const formatMoney = (value = 0) => {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat(currentCurrency.locale, {
    style: "currency",
    currency: currentCurrency.code,
    maximumFractionDigits: 0,
  }).format(amount);
};
