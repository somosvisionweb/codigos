import { test, expect, type Page } from '@playwright/test';
import { productStock, setStock, orderByNumber, db } from './helpers';

async function fillCheckout(page: Page, opts: { phone?: string; neighborhood?: string } = {}) {
  await page.getByLabel('Nome *').fill('Cliente E2E');
  await page.getByLabel('Telefone / WhatsApp *').fill(opts.phone ?? '(11) 98765-4321');
  await page.getByLabel('Bairro *').fill(opts.neighborhood ?? 'centro');
  await page.getByLabel('Cidade *').fill('Cidade Teste');
  await page.getByLabel('Rua e número *').fill('Rua das Flores, 100');
  await page.locator('#f-privacy').check();
}

test.describe('loja', () => {
  test('compra completa: opção, quantidade, persistência, pedido, estoque e WhatsApp', async ({ page, context }) => {
    const before = await productStock('desinfetante-5l', 'pinho');
    const beforeTrena = await productStock('trena-5m');

    // Produto sem opção, pelo card
    await page.goto('/categoria/ferramentas');
    await page.getByRole('button', { name: 'Adicionar Trena 5 m ao carrinho' }).click();
    await expect(page.locator('[data-cart-count]')).toHaveText('1');

    // Produto com opção obrigatória
    await page.goto('/produto/desinfetante-5l');
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await expect(page.getByText('Escolha uma opção para continuar.')).toBeVisible();
    await page.locator('label.opt', { hasText: 'Pinho' }).click();
    await page.getByRole('button', { name: 'Aumentar quantidade' }).click();
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await expect(page.locator('[data-cart-count]')).toHaveText('3');

    // Recarregar: carrinho persiste
    await page.reload();
    await expect(page.locator('[data-cart-count]')).toHaveText('3');

    // Alterar quantidade na gaveta
    await page.getByRole('button', { name: /Abrir carrinho/ }).click();
    const drawer = page.locator('#cart-drawer');
    await expect(drawer).toBeVisible();
    await drawer.getByRole('button', { name: 'Aumentar quantidade de Trena 5 m' }).click();
    await expect(page.locator('[data-cart-count]')).toHaveText('4');
    await drawer.getByRole('link', { name: 'Finalizar pedido' }).click();

    await expect(page).toHaveURL(/\/finalizar/);
    await fillCheckout(page);
    await expect(page.locator('#shipping-info')).toHaveText('Frete grátis para o seu endereço!');

    const popupPromise = context.waitForEvent('page').catch(() => null);
    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expect(page.getByRole('heading', { name: /Pedido #\d{4} recebido/ })).toBeVisible();
    const heading = await page.getByRole('heading', { name: /Pedido #\d{4} recebido/ }).textContent();
    const number = Number(heading!.match(/#(\d+)/)![1]);

    // Pedido gravado e estoque baixado
    const order = await orderByNumber(number);
    expect(order.status).toBe('novo');
    expect(order.items).toHaveLength(2);
    expect(order.total).toBe(2 * 1490 + 2 * 2490);
    expect(order.shippingKind).toBe('gratis');
    expect(await productStock('desinfetante-5l', 'pinho')).toBe(before - 2);
    expect(await productStock('trena-5m')).toBe(beforeTrena - 2);

    // WhatsApp gerado com a mensagem pronta
    const wa = page.getByRole('link', { name: 'Confirmar no WhatsApp' });
    const href = await wa.getAttribute('href');
    expect(href).toContain('https://wa.me/5511900000000?text=');
    const text = decodeURIComponent(href!.split('?text=')[1]);
    expect(text).toContain(`*#${String(number).padStart(4, '0')}*`);
    expect(text).toContain('• 2x Desinfetante 5L (Pinho) — R$ 49,80');
    expect(text).toContain('*Recebimento:* Entrega — Frete grátis');
    await popupPromise;

    // Pix copia e cola com o valor
    await expect(page.locator('#pix-code')).toHaveValue(/br\.gov\.bcb\.pix.*5405/);
    // Carrinho esvaziado após o pedido
    await expect(page.locator('[data-cart-count]')).toHaveAttribute('data-count', '0');
  });

  test('quantidade acima do estoque: erro claro e estoque não fica negativo', async ({ page }) => {
    await setStock('martelo-unha-27mm', 2);
    await page.goto('/produto/martelo-unha-27mm');
    await page.locator('#qty').fill('5');
    await page.locator('#qty').blur();
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.goto('/finalizar');
    // A conferência com o servidor já avisa o limite
    await expect(page.locator('.cart-warn').first()).toContainText('Só temos 2 unidades');
    await fillCheckout(page, { phone: '(11) 97777-1111' });
    await page.getByRole('button', { name: 'Enviar pedido' }).click();
    await expect(page.locator('#form-error')).toContainText('Ajuste os itens');
    expect(await productStock('martelo-unha-27mm')).toBe(2);

    // Mesmo forçando a requisição, o servidor recusa com erro por item
    const res = await page.request.post('/api/create-order', {
      data: {
        items: [{ productId: 'martelo-unha-27mm', variantId: null, quantity: 5 }],
        customer: { name: 'Xavier', phone: '11977771111', type: 'PF' }, fulfillment: 'retirada',
        address: { neighborhood: 'Centro', city: 'Cidade' }, paymentMethod: 'pix', acceptPrivacy: true,
      },
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.details.items[0].message).toContain('só temos 2 unidades');
    expect(await productStock('martelo-unha-27mm')).toBe(2);
  });

  test('duas compras simultâneas do último item: só uma passa', async ({ request }) => {
    await setStock('alicate-universal-8', 1);
    const body = (phone: string) => ({
      items: [{ productId: 'alicate-universal-8', variantId: null, quantity: 1 }],
      customer: { name: 'Concorrente', phone, type: 'PF' }, fulfillment: 'retirada',
      address: { neighborhood: 'Centro', city: 'Cidade' }, paymentMethod: 'dinheiro', acceptPrivacy: true,
    });
    const [a, b] = await Promise.all([
      request.post('/api/create-order', { data: body('11966660001') }),
      request.post('/api/create-order', { data: body('11966660002') }),
    ]);
    expect([a.status(), b.status()].sort()).toEqual([201, 409]);
    expect(await productStock('alicate-universal-8')).toBe(0);
  });

  test('preço forjado no corpo da requisição é ignorado', async ({ request }) => {
    const res = await request.post('/api/create-order', {
      data: {
        items: [{ productId: 'mascara-pff2', variantId: null, quantity: 3, price: 1, unitPrice: 1 }],
        subtotal: 3, total: 3, discount: 0,
        customer: { name: 'Forjador', phone: '11955554444', type: 'PF' }, fulfillment: 'retirada',
        address: { neighborhood: 'Centro', city: 'Cidade' }, paymentMethod: 'pix', acceptPrivacy: true,
      },
    });
    expect(res.status()).toBe(201);
    const data = await res.json();
    expect(data.total).toBe(3 * 450);
    const saved = (await db().doc(`orders/${data.orderId}`).get()).data()!;
    expect(saved.total).toBe(1350);
  });

  test('produto indisponível mostra "Avisar no WhatsApp"', async ({ page }) => {
    await setStock('limpa-pneus-5l', 0);
    await page.goto('/produto/limpa-pneus-5l');
    await expect(page.getByText('Indisponível').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Avisar no WhatsApp/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toHaveCount(0);
    await setStock('limpa-pneus-5l', 20);
  });

  test('busca sem acento e filtro por categoria', async ({ page }) => {
    await page.goto('/loja?q=BOTINA seguranca');
    await expect(page.locator('[data-product]:visible')).toHaveCount(1);
    await expect(page.locator('[data-shop-count]')).toContainText('1 produto');
    await page.locator('#shop-q').fill('xyzxyz');
    await expect(page.getByText('Não achou?')).toBeVisible();
    await page.goto('/categoria/calcados');
    await expect(page.locator('[data-product]')).toHaveCount(2);
  });

  test('lead de /empresas é gravado', async ({ page }) => {
    await page.goto('/empresas');
    await page.getByLabel('Seu nome *').fill('Síndica Teste');
    await page.getByLabel('Empresa / condomínio *').fill('Condomínio E2E');
    await page.getByLabel('WhatsApp *').fill('(11) 93333-2222');
    await page.getByLabel(/O que você precisa/).fill('30 galões de desinfetante por mês');
    await page.locator('#l-privacy').check();
    await page.getByRole('button', { name: 'Enviar pedido de orçamento' }).click();
    await expect(page.getByRole('heading', { name: 'Pedido de orçamento recebido!' })).toBeVisible();
    const snap = await db().collection('leads').where('company', '==', 'Condomínio E2E').get();
    expect(snap.size).toBe(1);
  });
});
