import type { APIRoute } from 'astro';
import { getCategories, getProducts } from '../server/repo';
import { siteUrl } from '../server/site';
import { PUBLIC_CACHE } from '../server/http';

export const prerender = false;
export const GET: APIRoute = async () => {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);
  const base = siteUrl();
  const urls = [
    { loc: '/', pr: '1.0' },
    { loc: '/loja', pr: '0.9' },
    { loc: '/empresas', pr: '0.8' },
    { loc: '/avaliacoes', pr: '0.5' },
    { loc: '/contato', pr: '0.5' },
    { loc: '/politicas', pr: '0.3' },
    ...categories.map((c) => ({ loc: `/categoria/${c.slug}`, pr: '0.8' })),
    ...products.map((p) => ({ loc: `/produto/${p.slug}`, pr: '0.7', lastmod: new Date(p.updatedAt).toISOString().slice(0, 10) })),
  ];
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(base + u.loc)}</loc>${'lastmod' in u && u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.pr}</priority></url>`).join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'Netlify-CDN-Cache-Control': PUBLIC_CACHE } });
};
