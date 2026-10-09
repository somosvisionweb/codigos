// Testes de integração das funções de servidor contra o emulador do Firestore.
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../../src/server/firebase';
import { createOrder, handleCreateOrder, orderSchema } from '../../src/server/handlers/createOrder';
import { cancelOrder, reopenOrder, trashOrder, resetOrders, emptyTrash, anonymizeCustomer } from '../../src/server/handlers/orderAdmin';
import { submitReview, submitLead, handleCatalog } from '../../src/server/handlers/public';
import { checkRateLimit } from '../../src/server/ratelimit';
import type { Staff } from '../../src/server/auth';
import type { Order, Product } from '../../src/lib/types';

const PROJECT = process.env.FIREBASE_PROJECT_ID || 'demo-loja-trabalhador';
const admin: Staff = { uid: 'admin1', role: 'admin', name: 'Dono', email: 'd@x', authTime: Date.now() };

async function clear() {
  await fetch(`http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
}

function product(id: string, over: Partial<Product> = {}): Omit<Product, 'id'> {
  return {
    name: id, slug: id, categoryId: 'limpeza', shortDescription: '', description: '', specs: [], price: 1000, promoPrice: null,
    unit: 'un', images: [], variants: [], stock: 10, minStock: 2, ca: null, active: true, featured: false, relatedIds: [],
    isKit: false, createdAt: 1, updatedAt: 1, createdBy: 'test', ...over,
  };
}

const baseInput = (items: { productId: string; variantId?: string | null; quantity: number }[], phone = '(11) 98888-7777') =>
  orderSchema.parse({
    items,
    customer: { name: 'Cliente Teste', phone, type: 'PF' },
    fulfillment: 'entrega',
    address: { neighborhood: 'Centro', city: 'Cidade', street: 'Rua A, 1' },
    paymentMethod: 'pix',
    acceptPrivacy: true,
  });

async function stock(id: string, variant?: string) {
  const p = (await db().doc(`products/${id}`).get()).data() as Product;
  return variant ? p.variants.find((v) => v.id === variant)!.stock : p.stock;
}

beforeEach(async () => {
  await clear();
  const fs = db();
  await fs.doc('settings/site').set({ whatsapp: '5511900000000', freeShippingAreas: ['Centro'], pixKey: 'loja@exemplo.com', pixReceiverName: 'Loja', pixReceiverCity: 'Cidade', lowStockThreshold: 5 });
  await fs.doc('products/desinf').set(product('desinf', { price: 2490, variants: [{ id: 'lavanda', label: 'Lavanda', stock: 3 }, { id: 'pinho', label: 'Pinho', stock: 1 }], stock: 4 }));
  await fs.doc('products/luva').set(product('luva', { price: 690, stock: 5 }));
  await fs.doc('products/kit').set(product('kit', { price: 5620, promoPrice: 4990, stock: 2 }));
  await fs.doc('products/off').set(product('off', { active: false }));
});

describe('create-order', () => {
  it('cria pedido com número sequencial, baixa estoque e cria cliente', async () => {
    const r1 = await createOrder(baseInput([{ productId: 'desinf', variantId: 'lavanda', quantity: 2 }, { productId: 'luva', quantity: 1 }]), null);
    const r2 = await createOrder(baseInput([{ productId: 'kit', quantity: 1 }]), null);
    expect(r1.number).toBe(1);
    expect(r2.number).toBe(2);
    expect(r1.numberLabel).toBe('#0001');
    expect(r1.total).toBe(2490 * 2 + 690);
    expect(r2.total).toBe(4990); // promoção aplicada no servidor
    expect(r1.shippingKind).toBe('gratis');
    expect(await stock('desinf', 'lavanda')).toBe(1);
    expect(await stock('desinf')).toBe(2); // espelho da soma das variantes
    expect(await stock('luva')).toBe(4);
    expect(r1.whatsappUrl).toContain('https://wa.me/5511900000000?text=');
    expect(decodeURIComponent(r1.whatsappUrl)).toContain('*#0001*');
    expect(r1.pix?.payload).toContain('br.gov.bcb.pix');
    const order = (await db().doc(`orders/${r1.orderId}`).get()).data() as Order;
    expect(order.stockDeducted).toBe(true);
    expect(order.reviewToken.length).toBeGreaterThanOrEqual(30);
    expect(order.customer.phone).toBe('5511988887777');
    const customer = (await db().doc('customers/5511988887777').get()).data()!;
    expect(customer.ordersCount).toBe(2);
    expect(customer.totalSpent).toBe(r1.total + r2.total);
  });

  it('recusa quantidade acima do estoque com erro claro e não deixa estoque negativo', async () => {
    await expect(createOrder(baseInput([{ productId: 'luva', quantity: 6 }]), null)).rejects.toMatchObject({ status: 409, code: 'estoque' });
    await expect(createOrder(baseInput([{ productId: 'desinf', variantId: 'pinho', quantity: 2 }]), null)).rejects.toThrow(/só temos 1 unidade/);
    await expect(createOrder(baseInput([{ productId: 'desinf', quantity: 1 }]), null)).rejects.toThrow(/Escolha uma opção/);
    await expect(createOrder(baseInput([{ productId: 'off', quantity: 1 }]), null)).rejects.toThrow(/não está mais disponível/);
    expect(await stock('luva')).toBe(5);
    expect(await stock('desinf', 'pinho')).toBe(1);
    expect((await db().collection('orders').get()).size).toBe(0);
  });

  it('duas compras simultâneas do último item: só uma passa', async () => {
    const results = await Promise.allSettled([
      createOrder(baseInput([{ productId: 'desinf', variantId: 'pinho', quantity: 1 }], '11 97777-0001'), null),
      createOrder(baseInput([{ productId: 'desinf', variantId: 'pinho', quantity: 1 }], '11 97777-0002'), null),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    expect(await stock('desinf', 'pinho')).toBe(0);
  });

  it('ignora preço e total forjados no corpo da requisição', async () => {
    const body = {
      items: [{ productId: 'luva', variantId: null, quantity: 2, price: 1, unitPrice: 1 }],
      customer: { name: 'Hacker', phone: '11 96666-5555', type: 'PF' },
      fulfillment: 'retirada', address: { neighborhood: 'X', city: 'Y' }, paymentMethod: 'dinheiro', acceptPrivacy: true,
      subtotal: 1, total: 1, discount: 99999,
    };
    const res = await handleCreateOrder(new Request('http://x/api/create-order', { method: 'POST', body: JSON.stringify(body) }), '10.0.0.1');
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.total).toBe(1380);
    const order = (await db().doc(`orders/${data.orderId}`).get()).data() as Order;
    expect(order.total).toBe(1380);
    expect(order.discount).toBe(0);
    expect(order.items[0].unitPrice).toBe(690);
  });

  it('valida campos, honeypot e venda manual sem login', async () => {
    const bad = await handleCreateOrder(new Request('http://x', { method: 'POST', body: JSON.stringify({ items: [] }) }));
    expect(bad.status).toBe(400);
    const bot = await handleCreateOrder(new Request('http://x', { method: 'POST', body: JSON.stringify({ ...baseInput([{ productId: 'luva', quantity: 1 }]), website: 'spam' }) }));
    expect(bot.status).toBe(400);
    const manual = await handleCreateOrder(new Request('http://x', { method: 'POST', body: JSON.stringify({ ...baseInput([{ productId: 'luva', quantity: 1 }]), source: 'manual' }) }));
    expect(manual.status).toBe(401);
    expect((await db().collection('orders').get()).size).toBe(0);
    const noPrivacy = await handleCreateOrder(new Request('http://x', { method: 'POST', body: JSON.stringify({ ...baseInput([{ productId: 'luva', quantity: 1 }]), acceptPrivacy: false }) }));
    expect(noPrivacy.status).toBe(400);
  });

  it('venda manual pelo painel baixa estoque', async () => {
    const input = orderSchema.parse({ items: [{ productId: 'luva', quantity: 2 }], customer: { name: 'Balcão' }, fulfillment: 'retirada', paymentMethod: 'dinheiro', source: 'manual', paid: true });
    const r = await createOrder(input, admin);
    const order = (await db().doc(`orders/${r.orderId}`).get()).data() as Order;
    expect(order.source).toBe('manual');
    expect(order.paymentStatus).toBe('pago');
    expect(await stock('luva')).toBe(3);
  });

  it('manutenção bloqueia pedidos do site', async () => {
    await db().doc('settings/site').set({ maintenanceMode: true }, { merge: true });
    await expect(createOrder(baseInput([{ productId: 'luva', quantity: 1 }]), null)).rejects.toMatchObject({ status: 503 });
  });

  it('aplica cupom validado no servidor', async () => {
    await db().doc('coupons/DEZ').set({ code: 'DEZ', type: 'percent', value: 10, minOrder: 0, validUntil: null, maxUses: 1, uses: 0, active: true });
    const r = await createOrder({ ...baseInput([{ productId: 'luva', quantity: 2 }]), couponCode: 'dez' }, null);
    expect(r.discount).toBe(138);
    expect(r.total).toBe(1380 - 138);
    await expect(createOrder({ ...baseInput([{ productId: 'luva', quantity: 1 }]), couponCode: 'DEZ' }, null)).rejects.toThrow(/esgotado/);
  });
});

describe('cancelar, reabrir, lixeira', () => {
  it('cancelar devolve estoque uma única vez; reabrir baixa de novo', async () => {
    const r = await createOrder(baseInput([{ productId: 'desinf', variantId: 'lavanda', quantity: 2 }]), null);
    expect(await stock('desinf', 'lavanda')).toBe(1);
    expect((await cancelOrder(r.orderId, admin)).changed).toBe(true);
    expect(await stock('desinf', 'lavanda')).toBe(3);
    expect((await cancelOrder(r.orderId, admin)).changed).toBe(false);
    expect(await stock('desinf', 'lavanda')).toBe(3);
    let customer = (await db().doc('customers/5511988887777').get()).data()!;
    expect(customer.ordersCount).toBe(0);
    expect(customer.totalSpent).toBe(0);
    expect((await reopenOrder(r.orderId, admin)).changed).toBe(true);
    expect(await stock('desinf', 'lavanda')).toBe(1);
    expect((await reopenOrder(r.orderId, admin)).changed).toBe(false);
    expect(await stock('desinf', 'lavanda')).toBe(1);
    customer = (await db().doc('customers/5511988887777').get()).data()!;
    expect(customer.ordersCount).toBe(1);
    const order = (await db().doc(`orders/${r.orderId}`).get()).data() as Order;
    expect(order.history.map((h) => h.action)).toEqual(['criado', 'cancelado', 'reaberto']);
  });

  it('reabrir sem saldo dá erro claro e não mexe no estoque', async () => {
    const r = await createOrder(baseInput([{ productId: 'kit', quantity: 2 }]), null);
    await cancelOrder(r.orderId, admin);
    await createOrder(baseInput([{ productId: 'kit', quantity: 2 }], '11 95555-4444'), null);
    expect(await stock('kit')).toBe(0);
    await expect(reopenOrder(r.orderId, admin)).rejects.toMatchObject({ status: 409 });
    expect(await stock('kit')).toBe(0);
  });

  it('excluir, restaurar, zerar e esvaziar lixeira NÃO alteram o estoque', async () => {
    const a = await createOrder(baseInput([{ productId: 'luva', quantity: 2 }]), null);
    await createOrder(baseInput([{ productId: 'luva', quantity: 1 }]), null);
    expect(await stock('luva')).toBe(2);
    await trashOrder(a.orderId, admin, 'delete');
    expect(await stock('luva')).toBe(2);
    let customer = (await db().doc('customers/5511988887777').get()).data()!;
    expect(customer.ordersCount).toBe(1);
    await trashOrder(a.orderId, admin, 'restore');
    customer = (await db().doc('customers/5511988887777').get()).data()!;
    expect(customer.ordersCount).toBe(2);
    expect(await stock('luva')).toBe(2);
    const reset = await resetOrders(admin);
    expect(reset.moved).toBe(2);
    expect(await stock('luva')).toBe(2);
    customer = (await db().doc('customers/5511988887777').get()).data()!;
    expect(customer.totalSpent).toBe(0);
    const emptied = await emptyTrash(admin);
    expect(emptied.deleted).toBe(2);
    expect(await stock('luva')).toBe(2);
    expect((await db().collection('orders').get()).size).toBe(0);
    expect((await db().collection('auditLog').get()).size).toBeGreaterThanOrEqual(4);
  });

  it('anonimizar cliente remove dados pessoais e mantém valores', async () => {
    const r = await createOrder(baseInput([{ productId: 'luva', quantity: 1 }]), null);
    await anonymizeCustomer('5511988887777', admin);
    const order = (await db().doc(`orders/${r.orderId}`).get()).data() as Order;
    expect(order.customer.name).toBe('Cliente anonimizado');
    expect(order.customer.phone).toBe('');
    expect(order.address.street).toBeNull();
    expect(order.total).toBe(690);
    expect((await db().doc('customers/5511988887777').get()).exists).toBe(false);
  });
});

describe('avaliação de compra verificada', () => {
  it('aceita token válido uma única vez e grava como pendente', async () => {
    const r = await createOrder(baseInput([{ productId: 'luva', quantity: 1 }]), null);
    const token = ((await db().doc(`orders/${r.orderId}`).get()).data() as Order).reviewToken;
    const input = { orderId: r.orderId, token, name: 'Maria Souza', role: '', text: 'Atendimento muito bom, entrega rápida.', rating: 5, consent: true };
    await expect(submitReview({ ...input, token: 'x'.repeat(32) })).rejects.toMatchObject({ status: 403 });
    await submitReview(input);
    const t = (await db().doc(`testimonials/order-${r.orderId}`).get()).data()!;
    expect(t.status).toBe('pendente');
    expect(t.source).toBe('compra_verificada');
    expect(t.displayName).toBe('Maria S.');
    expect(t.demo).toBe(false);
    await expect(submitReview(input)).rejects.toMatchObject({ status: 409 });
  });
});

describe('leads, catálogo e limite de taxa', () => {
  it('grava lead e devolve link de WhatsApp', async () => {
    const r = await submitLead({ name: 'Ana', company: 'Condomínio Sol', segment: 'Condomínio', items: '20 galões de desinfetante', phone: '11 94444-3333', email: '', city: 'Cidade', acceptPrivacy: true });
    const lead = (await db().doc(`leads/${r.leadId}`).get()).data()!;
    expect(lead.status).toBe('novo');
    expect(lead.phone).toBe('5511944443333');
    expect(r.whatsappUrl).toContain('wa.me/5511900000000');
  });

  it('catálogo público não expõe estoque acima do limite', async () => {
    const res = await handleCatalog(new Request('http://x/api/catalog?ids=luva,desinf,off,nao'));
    const data = await res.json();
    expect(data.products.luva.price).toBe(690);
    expect(data.products.luva.left).toBe(5); // 5 <= limite 5 → "últimas unidades"
    expect(data.products.off.active).toBe(false);
    expect(data.products.nao.active).toBe(false);
    await db().doc('products/luva').update({ stock: 50 });
    const again = await (await handleCatalog(new Request('http://x/api/catalog?ids=luva'))).json();
    expect(again.products.luva.left).toBeNull();
    expect(again.products.luva.availability).toBe('em_estoque');
    expect(JSON.stringify(again)).not.toContain('"stock"');
  });

  it('limitação de taxa bloqueia excesso', async () => {
    process.env.RATE_LIMIT_STRICT = 'true';
    await checkRateLimit('t:1', 2, 60_000);
    await checkRateLimit('t:1', 2, 60_000);
    await expect(checkRateLimit('t:1', 2, 60_000)).rejects.toMatchObject({ status: 429 });
    delete process.env.RATE_LIMIT_STRICT;
  });
});
