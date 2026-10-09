// Content-Security-Policy das páginas (site e painel).
// Em produção é estrita. Só quando o servidor roda com os emuladores do Firebase (desenvolvimento/testes)
// libera http://127.0.0.1 para o painel falar com eles.
import { defineMiddleware } from 'astro:middleware';

const emulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
const local = emulator ? ' http://127.0.0.1:9099 http://127.0.0.1:8080 http://127.0.0.1:9199 ws://127.0.0.1:*' : '';

export const CSP = [
  "default-src 'self'",
  "script-src 'self' https://www.googletagmanager.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com https://www.google-analytics.com https://*.google-analytics.com https://www.facebook.com${emulator ? ' http://127.0.0.1:9199' : ''}`,
  "font-src 'self'",
  `connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://connect.facebook.net https://www.facebook.com${local}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(emulator ? [] : ['upgrade-insecure-requests']),
].join('; ');

export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next();
  if ((res.headers.get('content-type') ?? '').includes('text/html')) {
    res.headers.set('Content-Security-Policy', CSP);
  }
  return res;
});
