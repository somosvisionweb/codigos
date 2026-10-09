/**
 * Normaliza telefone brasileiro para só dígitos com DDI 55: "(11) 98765-4321" → "5511987654321".
 * Retorna string vazia quando não parece um telefone válido (10 ou 11 dígitos + DDI).
 */
export function normalizePhone(input: string | null | undefined): string {
  let digits = (input ?? '').replace(/\D/g, '');
  if (!digits) return '';
  digits = digits.replace(/^0+/, ''); // "011..." (DDD com zero de operadora)
  if (digits.length === 10 || digits.length === 11) digits = '55' + digits;
  if (!digits.startsWith('55')) return '';
  if (digits.length !== 12 && digits.length !== 13) return '';
  return digits;
}

export function isValidPhone(input: string | null | undefined): boolean {
  return normalizePhone(input) !== '';
}

/** "5511987654321" → "(11) 98765-4321" */
export function formatPhone(normalized: string): string {
  const d = normalized.replace(/\D/g, '').replace(/^55/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return normalized;
}
