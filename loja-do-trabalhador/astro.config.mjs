// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import preact from '@astrojs/preact';

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  output: 'server',
  adapter: netlify({ cacheOnDemandPages: false }),
  integrations: [preact({ include: ['src/admin/**/*.tsx'] })],
  trailingSlash: 'never',
  build: { inlineStylesheets: 'auto' },
  prefetch: false,
  devToolbar: { enabled: false },
  security: { checkOrigin: false }, // as rotas /api validam origem/entrada por conta própria
  server: { host: '127.0.0.1', port: 4321 },
});
