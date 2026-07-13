import type { Product, StoreSettings, Supplier } from './types';

export const INITIAL_SUPPLIERS: Supplier[] = [];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  name: 'Loading Branch...',
  tin: '',
  physicalAddress: '',
  phone: '',
  email: '',
  currency: 'TZS',
  timezone: 'Africa/Dar_es_Salaam'
};

export const INITIAL_EXCHANGE_RATES = {
  TZS: 1,
  USD: 2600, // 1 USD = 2600 TZS
  EUR: 2800, // 1 EUR = 2800 TZS
};

export const formatCurrency = (amount: number, currency: 'TZS' | 'USD' | 'EUR' = 'TZS'): string => {
  if (currency === 'USD') {
    return `$${(amount / 2600).toFixed(2)}`;
  }
  if (currency === 'EUR') {
    return `€${(amount / 2800).toFixed(2)}`;
  }
  return `TZS ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatCurrencyWithoutSymbol = (amount: number, currency: 'TZS' | 'USD' | 'EUR' = 'TZS'): string => {
  if (currency === 'USD') {
    return `${(amount / 2600).toFixed(2)}`;
  }
  if (currency === 'EUR') {
    return `${(amount / 2800).toFixed(2)}`;
  }
  return `${amount.toFixed(2)}`;
};
