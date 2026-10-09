// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import preact from '@astrojs/preact';

// LOCAL_NODE=1 gera um build com servidor Node só para medir (Lighthouse) localmente; o deploy usa Netlify.
const localNode = process.env.LOCAL_NODE === '1';
const adapter = localNode ? (await import('@astrojs/node')).default({ mode: 'standalone' }) : netlify({ cacheOnDemandPages: false });

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  output: 'server',
  adapter,
  ...(localNode ? { outDir: 'dist-local' } : {}),
  integrations: [preact({ include: ['src/admin/**/*.tsx'] })],
  trailingSlash: 'never',
  build: { inlineStylesheets: 'auto' },
  prefetch: false,
  devToolbar: { enabled: false },
  security: { checkOrigin: false }, // as rotas /api validam origem/entrada por conta própria
  server: { host: '127.0.0.1', port: 4321 },
  // Sem scripts/arquivos embutidos no HTML: permite CSP com script-src 'self'.
  vite: { build: { assetsInlineLimit: 0 } },
});
