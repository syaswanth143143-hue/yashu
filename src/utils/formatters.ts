import { Currency, CurrencyConfig } from '../types';
import { CURRENCIES } from '../data/initialData';

export function formatCurrency(amount: number, currency: Currency = 'USD', showSign: boolean = false): string {
  const config = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = amount * config.rateToUSD;
  const isNegative = converted < 0;
  const absVal = Math.abs(converted);

  const formattedNum = absVal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sign = showSign ? (amount > 0 ? '+' : '-') : (isNegative ? '-' : '');
  return `${sign}${config.symbol}${formattedNum}`;
}

export function formatNumber(amount: number, currency: Currency = 'USD'): string {
  const config = CURRENCIES[currency] || CURRENCIES.USD;
  const converted = amount * config.rateToUSD;
  return `${config.symbol}${Math.abs(converted).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
