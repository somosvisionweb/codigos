/** Gera CSV (separador ";" para abrir direto no Excel em pt-BR) com BOM UTF-8. */
export function toCsv(rows: Record<string, unknown>[], columns?: string[]): string {
  const cols = columns ?? [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const esc = (v: unknown): string => {
    if (v == null) return '';
    let s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    // Evita injeção de fórmula ao abrir no Excel.
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(';'), ...rows.map((r) => cols.map((c) => esc(r[c])).join(';'))];
  return '﻿' + lines.join('\r\n');
}
