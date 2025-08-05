import { InvoiceItem } from '../types/invoice';

export const calculateItemTotal = (quantity: number, price: number): number => {
  return quantity * price;
};

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + item.total, 0);
};

export const calculateTax = (subtotal: number, taxRate: number): number => {
  return subtotal * (taxRate / 100);
};

export const calculateTotal = (subtotal: number, taxAmount: number): number => {
  return subtotal + taxAmount;
};

export const formatCurrency = (amount: number, currency: 'USD' | 'GBP' = 'USD'): string => {
  const currencyCode = currency === 'GBP' ? 'GBP' : 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
};