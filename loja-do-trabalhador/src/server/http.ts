import type { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

export function errorResponse(e: unknown): Response {
  if (e instanceof HttpError) {
    return json({ ok: false, error: e.code, message: e.message, details: e.details }, e.status);
  }
  console.error('[api] erro inesperado', e);
  return json({ ok: false, error: 'interno', message: 'Não foi possível concluir agora. Tente novamente em instantes.' }, 500);
}

export function zodFields(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export async function readJson(request: Request, maxBytes = 50_000): Promise<unknown> {
  const len = Number(request.headers.get('content-length') ?? 0);
  if (len > maxBytes) throw new HttpError(413, 'grande_demais', 'Requisição grande demais.');
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, 'grande_demais', 'Requisição grande demais.');
  try {
    return JSON.parse(text || '{}');
  } catch {
    throw new HttpError(400, 'json_invalido', 'Dados inválidos.');
  }
}

/** Cache de CDN para páginas públicas: atualizações do painel aparecem em ~1 minuto. */
export const PUBLIC_CACHE = 'public, max-age=0, s-maxage=60, stale-while-revalidate=300';

export function setPublicCache(headers: Headers) {
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  headers.set('Netlify-CDN-Cache-Control', PUBLIC_CACHE);
  headers.set('CDN-Cache-Control', PUBLIC_CACHE);
}

export function clientIp(request: Request, fallback?: string): string {
  return (
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    fallback ||
    'desconhecido'
  );
}
