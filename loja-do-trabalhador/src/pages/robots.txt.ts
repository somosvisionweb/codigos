import type { APIRoute } from 'astro';
import { siteUrl } from '../server/site';

export const prerender = false;
export const GET: APIRoute = () =>
  new Response(
    ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /finalizar', 'Disallow: /avaliar/', 'Disallow: /api/', '', `Sitemap: ${siteUrl()}/sitemap.xml`, ''].join('\n'),
    { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' } },
  );
