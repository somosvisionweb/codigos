/** Remove acentos, espaços extras e diferença de maiúsculas para comparação. */
export function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Gera slug de URL: "Óculos de Segurança 5L" → "oculos-de-seguranca-5l". */
export function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Limpa texto livre vindo do usuário: remove caracteres de controle e limita o tamanho. */
export function cleanText(value: unknown, max = 500): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, max);
}

/** Escapa texto para inserção em HTML (usado onde não há escape automático). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** "Maria Aparecida Souza" → "Maria S." */
export function shortName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last.charAt(0).toUpperCase()}.`;
}

/** Busca simples: todos os termos precisam aparecer (sem acento/maiúscula). */
export function matchesSearch(haystack: string, query: string): boolean {
  const h = normalizeText(haystack);
  const terms = normalizeText(query).split(' ').filter(Boolean);
  return terms.every((t) => h.includes(t));
}
