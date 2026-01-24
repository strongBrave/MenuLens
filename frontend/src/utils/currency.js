// Simple exchange rate cache (In production, fetch from API)
// Rates roughly as of late 2024/early 2025
const EXCHANGE_RATES = {
  base: 'USD',
  rates: {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 151.5,
    CNY: 7.23,
    THB: 36.5,
    KRW: 1350,
    VND: 25400,
    SGD: 1.35,
    MYR: 4.75,
    IDR: 16100,
    HKD: 7.82,
    TWD: 32.5,
    AUD: 1.52,
    CAD: 1.37
  }
};

const SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  THB: '฿',
  KRW: '₩',
  VND: '₫',
  SGD: 'S$',
  HKD: 'HK$',
  TWD: 'NT$',
  AUD: 'A$',
  CAD: 'C$'
};

/**
 * Convert price from source currency to target currency
 * @param {string|number} price - Original price
 * @param {string} sourceCurrency - Original currency code (e.g. JPY)
 * @param {string} targetCurrency - Target currency code (e.g. USD)
 * @returns {string|null} - Formatted converted price (e.g. ".50")
 */
export function convertCurrency(price, sourceCurrency, targetCurrency) {
  if (!price || !sourceCurrency || !targetCurrency) return null;
  
  // Clean price string (remove non-numeric chars except dot)
  const cleanPrice = parseFloat(String(price).replace(/[^0-9.]/g, ''));
  if (isNaN(cleanPrice)) return null;

  // Normalize codes
  const source = sourceCurrency.toUpperCase();
  const target = targetCurrency.toUpperCase();

  if (source === target) return null;

  // Get rates
  const sourceRate = EXCHANGE_RATES.rates[source];
  const targetRate = EXCHANGE_RATES.rates[target];

  if (!sourceRate || !targetRate) return null;

  // Convert: Source -> USD -> Target
  const priceInUSD = cleanPrice / sourceRate;
  const convertedPrice = priceInUSD * targetRate;

  // Format based on target currency
  const symbol = SYMBOLS[target] || target;
  
  // If target is JPY, KRW, VND (no decimals usually), round to int
  if (['JPY', 'KRW', 'VND', 'IDR'].includes(target)) {
    return `${symbol}${Math.round(convertedPrice).toLocaleString()}`;
  }

  return `${symbol}${convertedPrice.toFixed(2)}`;
}

export const AVAILABLE_CURRENCIES = Object.keys(EXCHANGE_RATES.rates);
