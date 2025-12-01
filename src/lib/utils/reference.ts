import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 8);

export function generateReferenceCode(): string {
  const id = nanoid();
  return `MAY-${id.slice(0, 4)}-${id.slice(4)}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function normalizeReference(reference: string): string {
  return reference.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

