import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import { ADMIN, SELLER, adminLogin, db, productStock, setStock, orderByNumber } from './helpers';

async function login(page: Page, who = ADMIN) {
  await adminLogin(page, who);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Hooks = { auth: any; db: any; doc: any; updateDoc: any };

async function idToken(page: Page): Promise<string> {
  await page.waitForFunction(() => Boolean((window as unknown as { __ldt?: unknown }).__ldt));
  return page.evaluate(() => (window as unknown as { __ldt: Hooks }).__ldt.auth.currentUser.getIdToken());
}

async function apiOrder(request: APIRequestContext, productId: string, quantity: number, phone: string, variantId: string | null = null) {
  const res = await request.post('/api/create-order', {
    data: {
      items: [{ productId, variantId, quantity }],
      customer: { name: 'Cliente Painel', phone, type: 'PF' }, fulfillment: 'retirada',
      address: { neighborhood: 'Centro', city: 'Cidade' }, paymentMethod: 'pix', acceptPrivacy: true,
    },
  });
  expect(res.status()).toBe(201);
  return (await res.json()) as { orderId: string; number: number; numberLabel: string };
}

test.describe('painel admin', () => {
  test('pedido em tempo real, status, pagamento, cancelar/reabrir e impressão', async ({ page, request }) => {
    await setStock('detergente-neutro-5l', 30);
    await login(page);
    await page.goto('/admin#/pedidos');
    await expect(page.getByRole('heading', { name: 'Pedidos' })).toBeVisible();

    // Pedido chega com a página aberta (onSnapshot)
    const o = await apiOrder(request, 'detergente-neutro-5l', 3, '11981110001');
    await expect(page.getByRole('link', { name: o.numberLabel })).toBeVisible();
    await expect(page).toHaveTitle(/Novo/);
    expect(await productStock('detergente-neutro-5l')).toBe(27);

    await page.getByRole('link', { name: o.numberLabel }).click();
    await expect(page.getByRole('heading', { name: `Pedido ${o.numberLabel}` })).toBeVisible();
    await page.getByRole('button', { name: 'Marcar como “Confirmado”' }).click();
    await expect(page.locator('.badge.b-confirmado').first()).toBeVisible();
    await page.getByRole('button', { name: 'Marcar como pago' }).click();
    await expect(page.locator('.badge.b-pago').first()).toBeVisible();
    // A tela atualiza antes do servidor confirmar (compensação de latência): espera o banco.
    await expect.poll(async () => (await orderByNumber(o.number)).paymentStatus).toBe('pago');
    let saved = await orderByNumber(o.number);
    expect(saved.status).toBe('confirmado');

    // Cancelar devolve estoque
    await page.getByRole('button', { name: 'Cancelar pedido (devolve estoque)' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar e devolver estoque' }).click();
    await expect(page.getByRole('button', { name: 'Reabrir pedido' })).toBeVisible();
    expect(await productStock('detergente-neutro-5l')).toBe(30);
    // Cancelar de novo (pela API) não devolve duas vezes
    const token = await idToken(page);
    const again = await request.post('/api/cancel-order', { data: { orderId: o.orderId }, headers: { authorization: `Bearer ${token}` } });
    expect((await again.json()).changed).toBe(false);
    expect(await productStock('detergente-neutro-5l')).toBe(30);

    // Reabrir baixa de novo
    await page.getByRole('button', { name: 'Reabrir pedido' }).click();
    await expect(page.getByRole('button', { name: 'Cancelar pedido (devolve estoque)' })).toBeVisible();
    expect(await productStock('detergente-neutro-5l')).toBe(27);
    saved = await orderByNumber(o.number);
    expect(saved.history.map((h) => h.action)).toEqual(expect.arrayContaining(['criado', 'status:confirmado', 'pagamento:pago', 'cancelado', 'reaberto']));

    // Impressão do cupom
    await page.getByRole('link', { name: 'Imprimir cupom' }).click();
    await expect(page.locator('.receipt')).toContainText(`Pedido ${o.numberLabel}`);
    await expect(page.locator('.receipt img.qr')).toBeVisible();
    await page.getByRole('link', { name: 'Ver romaneio A4' }).click();
    await expect(page.locator('.a4')).toContainText('Romaneio');
  });

  test('excluir, restaurar e zerar não alteram o estoque; zerar baixa backup antes', async ({ page, request }) => {
    await setStock('trena-5m', 50);
    const a = await apiOrder(request, 'trena-5m', 2, '11982220001');
    await apiOrder(request, 'trena-5m', 1, '11982220002');
    expect(await productStock('trena-5m')).toBe(47);
    await login(page);
    await page.goto(`/admin#/pedidos/${a.orderId}`);
    await page.getByRole('button', { name: 'Excluir (lixeira)' }).click();
    await expect(page.getByRole('dialog')).toContainText('Excluir não devolve o estoque');
    await page.getByRole('dialog').getByRole('button', { name: 'Mover para a lixeira' }).click();
    await expect(page.getByRole('button', { name: 'Restaurar da lixeira' })).toBeVisible();
    expect(await productStock('trena-5m')).toBe(47);
    await page.getByRole('button', { name: 'Restaurar da lixeira' }).click();
    await expect(page.getByRole('button', { name: 'Excluir (lixeira)' })).toBeVisible();
    expect(await productStock('trena-5m')).toBe(47);

    // Zerar tudo: exige palavra + senha e baixa o backup (JSON e CSV) antes
    await page.goto('/admin#/pedidos');
    await page.getByRole('button', { name: 'Zerar tudo' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('button', { name: 'Baixar backup e zerar' })).toBeDisabled();
    await dialog.getByLabel(/Digite/).fill('ZERAR');
    await dialog.getByLabel('Sua senha').fill(ADMIN.password);
    const downloads: string[] = [];
    page.on('download', (d) => downloads.push(d.suggestedFilename()));
    await dialog.getByRole('button', { name: 'Baixar backup e zerar' }).click();
    await expect(page.getByText(/movidos para a lixeira/)).toBeVisible({ timeout: 20_000 });
    expect(downloads.some((f) => f.endsWith('.json'))).toBe(true);
    expect(downloads.some((f) => f.endsWith('.csv'))).toBe(true);
    const active = await db().collection('orders').where('deletedAt', '==', null).get();
    expect(active.size).toBe(0);
    expect(await productStock('trena-5m')).toBe(47);

    // Esvaziar lixeira também não mexe no estoque
    await page.getByRole('button', { name: 'Lixeira' }).click();
    await page.getByRole('button', { name: 'Esvaziar lixeira' }).click();
    await page.getByRole('dialog').getByLabel(/Digite/).fill('ESVAZIAR');
    await page.getByRole('dialog').getByLabel('Sua senha').fill(ADMIN.password);
    await page.getByRole('dialog').getByRole('button', { name: 'Apagar definitivamente' }).click();
    await expect(page.getByText(/apagados definitivamente/)).toBeVisible();
    expect((await db().collection('orders').get()).size).toBe(0);
    expect(await productStock('trena-5m')).toBe(47);
  });

  test('produto: criar com foto, estoque direto, repor e desativar', async ({ page }) => {
    await login(page);
    await page.goto('/admin#/produtos/novo');
    await page.getByLabel('Nome *').fill('Balde E2E 20L');
    await page.getByLabel('Categoria *').selectOption('limpeza');
    await page.getByLabel('Preço (R$) *').fill('19,90');
    await page.getByLabel('Estoque', { exact: true }).fill('7');
    // Foto: PNG 2x2 gerado no teste
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMDAAAANHQEDasKb6QAAAABJRU5ErkJggg==', 'base64');
    await page.locator('input[type=file]').setInputFiles({ name: 'balde.png', mimeType: 'image/png', buffer: png });
    await expect(page.locator('.img-item img')).toHaveCount(1, { timeout: 20_000 });
    await page.getByRole('button', { name: 'Salvar produto' }).click();
    await expect(page.getByRole('heading', { name: 'Produtos' })).toBeVisible();
    const snap = await db().collection('products').where('slug', '==', 'balde-e2e-20l').get();
    expect(snap.size).toBe(1);
    const created = snap.docs[0].data();
    expect(created.price).toBe(1990);
    expect(created.images[0].url).toContain('.webp');
    const id = snap.docs[0].id;

    // Site mostra o produto
    const site = await page.request.get('/produto/balde-e2e-20l');
    expect(site.status()).toBe(200);

    // Estoque direto na lista
    await page.getByLabel('Buscar').fill('Balde E2E');
    const stockInput = page.getByLabel('Estoque de Balde E2E 20L', { exact: true });
    await stockInput.fill('12');
    await stockInput.press('Enter');
    await stockInput.blur();
    await expect.poll(() => productStock(id)).toBe(12);

    // Repor soma ao estoque atual
    await page.getByRole('button', { name: 'Repor estoque de Balde E2E 20L' }).click();
    await page.getByLabel('Quantas unidades chegaram?').fill('5');
    await page.getByRole('button', { name: 'Somar ao estoque' }).click();
    await expect.poll(() => productStock(id)).toBe(17);

    // Desativar: some do site
    await page.getByRole('button', { name: 'Desativar' }).click();
    await expect.poll(async () => (await db().doc(`products/${id}`).get()).data()!.active).toBe(false);
    expect((await page.request.get('/produto/balde-e2e-20l')).status()).toBe(404);
  });

  test('vendedor não edita preço, não cancela e não acessa Configurações', async ({ page, request }) => {
    const o = await apiOrder(request, 'mascara-pff2', 1, '11983330001');
    await login(page, SELLER);
    await expect(page.getByRole('link', { name: 'Configurações' })).toHaveCount(0);
    await page.goto('/admin#/configuracoes');
    await expect(page.getByText('Seu usuário não tem acesso a esta área.')).toBeVisible();
    await page.goto('/admin#/produtos/mascara-pff2');
    await expect(page.getByText('Somente leitura')).toBeVisible();
    await expect(page.getByLabel('Preço (R$) *')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Salvar produto' })).toHaveCount(0);
    await page.goto(`/admin#/pedidos/${o.orderId}`);
    await page.getByRole('button', { name: 'Marcar como “Confirmado”' }).click();
    await expect(page.locator('.badge.b-confirmado').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Cancelar pedido/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Excluir/ })).toHaveCount(0);
    // Mesmo pela API ou direto no banco, o vendedor é barrado
    const token = await idToken(page);
    const res = await request.post('/api/cancel-order', { data: { orderId: o.orderId }, headers: { authorization: `Bearer ${token}` } });
    expect(res.status()).toBe(403);
    const denied = await page.evaluate(async () => {
      const { db, doc, updateDoc } = (window as unknown as { __ldt: Hooks }).__ldt;
      try {
        await updateDoc(doc(db, 'products/mascara-pff2'), { price: 1 });
        return false;
      } catch {
        return true;
      }
    });
    expect(denied).toBe(true);
    expect((await db().doc('products/mascara-pff2').get()).data()!.price).toBe(450);
  });

  test('depoimento de compra verificada: pedir, enviar, aprovar e exibir com selo', async ({ page, request }) => {
    // Dois depoimentos reais já aprovados (para a seção aparecer com 3+)
    for (const [i, name] of ['Ana Teste', 'Bruno Teste'].entries()) {
      await db().doc(`testimonials/manual-${i}`).set({
        name, displayName: name, role: null, text: 'Depoimento cadastrado no teste automatizado.', rating: 5, source: 'whatsapp',
        orderId: null, productId: null, imageUrl: null, consent: true, status: 'aprovado', featured: false, order: i, demo: false, createdAt: Date.now(), updatedAt: Date.now(),
      });
    }
    const o = await apiOrder(request, 'luva-pigmentada', 2, '11984440001', 'm');
    await login(page);
    await page.goto(`/admin#/pedidos/${o.orderId}`);
    for (const s of ['Confirmado', 'Separando', 'Pronto p/ retirada', 'Concluído']) {
      await page.getByRole('button', { name: `Marcar como “${s}”` }).click();
      await expect(page.locator('.badge').filter({ hasText: s }).first()).toBeVisible();
    }
    const link = page.getByRole('link', { name: 'Pedir avaliação pelo WhatsApp' });
    const href = decodeURIComponent((await link.getAttribute('href'))!);
    const reviewUrl = href.match(/https?:\/\/\S+\/avaliar\/\S+/)![0];

    // Cliente abre o link e avalia
    const customer = await page.context().newPage();
    await customer.goto(reviewUrl);
    await expect(customer.getByText('Compra verificada')).toBeVisible();
    await customer.locator('label', { hasText: '5 ★' }).click();
    await customer.getByLabel('Seu depoimento *').fill('Luvas de ótima qualidade e atendimento rápido.');
    await customer.getByLabel('Seu nome *').fill('Carla Verificada Souza');
    await customer.locator('#r-consent').check();
    await customer.getByRole('button', { name: 'Enviar avaliação' }).click();
    await expect(customer.getByText('Obrigado pela avaliação!')).toBeVisible();

    // Link reutilizado ou inválido é recusado
    await customer.goto(reviewUrl);
    await expect(customer.getByRole('heading', { name: 'Obrigado!' })).toBeVisible();
    await customer.goto(reviewUrl.replace(/t=[^&]+/, 't=token-invalido-123456'));
    await expect(customer.getByRole('heading', { name: 'Link de avaliação inválido' })).toBeVisible();
    const token = new URL(reviewUrl).searchParams.get('t');
    const reuse = await request.post('/api/submit-review', { data: { orderId: o.orderId, token, name: 'Outro', text: 'Tentando de novo aqui.', rating: 1, consent: true } });
    expect(reuse.status()).toBe(409);

    // Pendente no painel → aprovar
    await page.goto('/admin#/depoimentos');
    await expect(page.getByText('Luvas de ótima qualidade')).toBeVisible();
    await page.getByRole('button', { name: 'Aprovar' }).first().click();
    await expect(page.getByText(/Depoimento aprovado/)).toBeVisible();

    // Aparece no site com selo
    await customer.goto('/avaliacoes');
    const card = customer.locator('figure.testi', { hasText: 'Luvas de ótima qualidade' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('Carla S.');
    await expect(card).toContainText('Compra verificada');
  });

  test('orçamento de /empresas aparece no painel', async ({ page, request }) => {
    const res = await request.post('/api/submit-lead', {
      data: { name: 'Gerente Obra', company: 'Construtora Painel E2E', segment: 'Obras e construtoras', items: '50 capacetes', phone: '11985550001', acceptPrivacy: true },
    });
    expect(res.status()).toBe(201);
    await login(page);
    await page.goto('/admin#/orcamentos');
    await expect(page.getByRole('heading', { name: 'Construtora Painel E2E' })).toBeVisible();
  });
});
