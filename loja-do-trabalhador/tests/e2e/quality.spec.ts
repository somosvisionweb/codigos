// Layout responsivo (375/768/1280), acessibilidade automática (axe), teclado e regras de prova social.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { adminLogin, db } from './helpers';

const WIDTHS = [375, 768, 1280];
const PUBLIC = ['/', '/loja', '/categoria/epis', '/produto/kit-obra-segura', '/finalizar', '/empresas', '/contato', '/politicas', '/avaliacoes', '/pagina-que-nao-existe'];
const ADMIN_PAGES = ['', 'pedidos', 'produtos', 'produtos/desinfetante-5l', 'clientes', 'orcamentos', 'depoimentos', 'configuracoes', 'conteudo', 'relatorios', 'pedidos/nova'];

async function noHorizontalScroll(page: Page) {
  const { sw, w } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: window.innerWidth }));
  expect(sw, `rolagem horizontal em ${page.url()}`).toBeLessThanOrEqual(w);
}

test.describe('qualidade', () => {
  test('site público sem rolagem horizontal e sem erros de console em 375, 768 e 1280', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && !m.text().includes('404') && errors.push(m.text()));
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of PUBLIC) {
        await page.goto(path);
        await noHorizontalScroll(page);
      }
    }
    expect(errors).toEqual([]);
  });

  test('painel sem rolagem horizontal em 375, 768 e 1280; tabelas viram cartões no celular', async ({ page }) => {
    await adminLogin(page);
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      for (const p of ADMIN_PAGES) {
        await page.goto(`/admin#/${p}`);
        await page.waitForTimeout(400);
        await noHorizontalScroll(page);
      }
    }
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto('/admin#/produtos');
    await expect(page.locator('table.stack thead')).toBeHidden();
  });

  test('acessibilidade automática (axe) nas páginas principais', async ({ page }) => {
    for (const path of ['/', '/loja', '/produto/desinfetante-5l', '/finalizar', '/empresas', '/avaliacoes']) {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${path}: ${v.id} — ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    }
  });

  test('gaveta do carrinho: foco preso e ESC fecha', async ({ page }) => {
    await page.goto('/produto/trena-5m');
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    const open = page.getByRole('button', { name: /Abrir carrinho/ });
    await open.focus();
    await page.keyboard.press('Enter');
    const drawer = page.locator('#cart-drawer');
    await expect(drawer).toHaveAttribute('aria-hidden', 'false');
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.getElementById('cart-drawer')!.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(drawer).toHaveAttribute('aria-hidden', 'true');
    await expect(open).toBeFocused();
  });

  test('produção nunca exibe depoimentos demo; sem 3 aprovados reais não há seção nem "0 avaliações"', async ({ page }) => {
    const all = await db().collection('testimonials').get();
    await Promise.all(all.docs.map((d) => d.ref.delete()));
    const now = Date.now();
    for (const i of [1, 2, 3, 4, 5]) {
      await db().doc(`testimonials/demo-${i}`).set({
        name: `DEMONSTRAÇÃO ${i}`, displayName: `DEMONSTRAÇÃO ${i}`, text: '[DEMONSTRAÇÃO] fictício', rating: 5, source: 'whatsapp',
        consent: true, status: 'aprovado', featured: false, order: i, demo: true, createdAt: now, updatedAt: now,
      });
    }
    // O servidor de testes roda SEM SHOW_DEMO_TESTIMONIALS: comportamento igual ao de produção.
    for (const path of ['/', '/avaliacoes']) {
      await page.goto(path);
      await expect(page.locator('body')).not.toContainText('DEMONSTRAÇÃO');
      await expect(page.locator('body')).not.toContainText('0 avaliações');
      await expect(page.getByText('Já comprou com a gente?')).toBeVisible();
      const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(ld.join('')).not.toContain('AggregateRating');
    }
    await Promise.all([1, 2, 3, 4, 5].map((i) => db().doc(`testimonials/demo-${i}`).delete()));
  });

  test('SEO: título, descrição, canonical, um h1, robots e sitemap', async ({ page, request }) => {
    for (const path of ['/', '/loja', '/produto/botina-bico-composite', '/empresas']) {
      await page.goto(path);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
      expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toContain(path === '/' ? 'http' : path);
      expect(await page.locator('html').getAttribute('lang')).toBe('pt-BR');
      const missingAlt = await page.locator('img:not([alt])').count();
      expect(missingAlt).toBe(0);
    }
    await page.goto('/produto/botina-bico-composite');
    const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).join('');
    expect(ld).toContain('"@type":"Product"');
    expect(ld).toContain('"priceCurrency":"BRL"');
    expect(ld).toContain('BreadcrumbList');
    await page.goto('/finalizar');
    expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex');
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Disallow: /admin');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain('/produto/desinfetante-5l');
    expect(sitemap).not.toContain('/admin');
  });
});
