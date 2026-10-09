import type { Cents } from './types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Formata centavos como moeda brasileira: 2490 → "R$ 24,90". */
export function formatBRL(cents: Cents): string {
  // Intl usa espaço não separável; normalizamos para espaço comum (mensagens, CSV, testes).
  return brl.format((cents || 0) / 100).replace(/\u00a0/g, ' ');
}

/** Converte reais (número ou texto "24,90") para centavos inteiros. */
export function toCents(value: number | string): Cents {
  if (typeof value === 'number') return Math.round(value * 100);
  const clean = value.trim().replace(/[^\d,.-]/g, '');
  // "1.234,56" → 1234.56 ; "24.90" → 24.90 ; "24,9" → 24.9
  const normalized = clean.includes(',') ? clean.replace(/\./g, '').replace(',', '.') : clean;
  const n = Number(normalized);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

/** Centavos para texto editável "24,90". */
export function centsToInput(cents: Cents | null | undefined): string {
  if (cents == null || Number.isNaN(cents)) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}
