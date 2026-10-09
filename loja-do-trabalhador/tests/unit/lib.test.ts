import { describe, expect, it } from 'vitest';
import { formatBRL, toCents, centsToInput } from '../../src/lib/money';
import { normalizePhone, formatPhone } from '../../src/lib/phone';
import { normalizeText, slugify, shortName, matchesSearch, cleanText } from '../../src/lib/text';
import { isFreeShippingArea, shippingKindFor } from '../../src/lib/shipping';
import { buildOrderMessage, whatsappLink, formatOrderNumber } from '../../src/lib/whatsapp';
import { buildPixPayload, crc16 } from '../../src/lib/pix';
import { calculateOrder, couponDiscount, mergeLines } from '../../src/lib/order-calc';
import { availabilityOf, stockOf, effectivePrice } from '../../src/lib/catalog';
import { startOfDay, startOfWeek, startOfMonth, startOfYear, dayKey, zonedMidnight } from '../../src/lib/dates';
import { toCsv } from '../../src/lib/csv';
import type { Product, Coupon } from '../../src/lib/types';

const product = (over: Partial<Product> = {}): Product => ({
  id: 'p1', name: 'Desinfetante 5L', slug: 'desinfetante-5l', categoryId: 'limpeza',
  shortDescription: '', description: '', specs: [], price: 2490, promoPrice: null, unit: 'galão 5L',
  images: [], variants: [], stock: 10, minStock: 3, ca: null, active: true, featured: false,
  relatedIds: [], isKit: false, createdAt: 0, updatedAt: 0, createdBy: 'seed', ...over,
});

describe('dinheiro', () => {
  it('formata BRL', () => {
    expect(formatBRL(2490)).toBe('R$ 24,90');
    expect(formatBRL(123456)).toBe('R$ 1.234,56');
  });
  it('converte para centavos sem erro de arredondamento', () => {
    expect(toCents(24.9)).toBe(2490);
    expect(toCents('24,90')).toBe(2490);
    expect(toCents('1.234,56')).toBe(123456);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(centsToInput(2490)).toBe('24,90');
  });
});

describe('telefone', () => {
  it('normaliza para DDI 55 só com dígitos', () => {
    expect(normalizePhone('(11) 98765-4321')).toBe('5511987654321');
    expect(normalizePhone('+55 11 98765-4321')).toBe('5511987654321');
    expect(normalizePhone('011 98765 4321')).toBe('5511987654321');
    expect(normalizePhone('11 3333-4444')).toBe('551133334444');
    expect(normalizePhone('123')).toBe('');
    expect(normalizePhone('')).toBe('');
    expect(formatPhone('5511987654321')).toBe('(11) 98765-4321');
  });
});

describe('texto', () => {
  it('normaliza sem acento e maiúscula', () => {
    expect(normalizeText('  São  PAULO ')).toBe('sao paulo');
    expect(slugify('Óculos de Segurança — Fumê 5L')).toBe('oculos-de-seguranca-fume-5l');
    expect(shortName('Maria Aparecida Souza')).toBe('Maria S.');
    expect(shortName('João')).toBe('João');
    expect(matchesSearch('Botina de Segurança Bico Composite', 'botina seguranca')).toBe(true);
    expect(matchesSearch('Botina', 'luva')).toBe(false);
    expect(cleanText('<script>oi</script>\u0007', 100)).toBe('scriptoi/script');
  });
});

describe('frete', () => {
  const areas = ['Centro', 'Vila São José', 'Jundiaí'];
  it('compara bairro e cidade sem acento e sem maiúscula', () => {
    expect(isFreeShippingArea(areas, 'vila sao jose', 'Outra')).toBe(true);
    expect(isFreeShippingArea(areas, 'Qualquer', 'JUNDIAI')).toBe(true);
    expect(isFreeShippingArea(areas, 'Longe', 'Campinas')).toBe(false);
    expect(isFreeShippingArea(['TODO_AREAS'], 'todo_areas', '')).toBe(false);
    expect(isFreeShippingArea([], 'Centro', '')).toBe(false);
  });
  it('define o tipo de frete', () => {
    expect(shippingKindFor('retirada', areas, '', '')).toBe('retirada');
    expect(shippingKindFor('entrega', areas, 'centro', '')).toBe('gratis');
    expect(shippingKindFor('entrega', areas, 'x', 'y')).toBe('a_combinar');
  });
});

describe('cálculo do pedido', () => {
  const p1 = product();
  const p2 = product({
    id: 'p2', name: 'Luva', price: 690, variants: [{ id: 'm', label: 'M', stock: 2 }, { id: 'g', label: 'G', stock: 0 }],
  });
  const p3 = product({ id: 'p3', name: 'Kit', price: 5620, promoPrice: 4990 });
  const map = new Map([p1, p2, p3].map((p) => [p.id, p]));

  it('recalcula preços a partir do banco e usa promoção', () => {
    const r = calculateOrder(
      [{ productId: 'p1', variantId: null, quantity: 2 }, { productId: 'p3', variantId: null, quantity: 1 }],
      map, { shippingKind: 'gratis' },
    );
    expect(r.errors).toEqual([]);
    expect(r.subtotal).toBe(2490 * 2 + 4990);
    expect(r.total).toBe(r.subtotal);
    expect(r.items[1].unitPrice).toBe(4990);
  });
  it('junta linhas repetidas', () => {
    expect(mergeLines([
      { productId: 'a', variantId: null, quantity: 1 }, { productId: 'a', variantId: null, quantity: 2 },
    ])).toEqual([{ productId: 'a', variantId: null, quantity: 3 }]);
  });
  it('exige opção e verifica estoque por variante', () => {
    const r = calculateOrder([
      { productId: 'p2', variantId: null, quantity: 1 },
      { productId: 'p2', variantId: 'm', quantity: 3 },
      { productId: 'p2', variantId: 'g', quantity: 1 },
      { productId: 'zz', variantId: null, quantity: 1 },
    ], map, { shippingKind: 'gratis' });
    expect(r.items).toHaveLength(0);
    expect(r.errors.map((e) => e.reason)).toEqual(['opcao_obrigatoria', 'estoque_insuficiente', 'sem_estoque', 'nao_encontrado']);
    expect(r.errors[1].available).toBe(2);
  });
  it('aplica cupom validado', () => {
    const c: Coupon = { id: 'X', code: 'X', type: 'percent', value: 10, minOrder: 1000, validUntil: null, maxUses: null, uses: 0, active: true };
    expect(couponDiscount(c, 5000, 0).discount).toBe(500);
    expect(couponDiscount(c, 500, 0).error).toBeTruthy();
    expect(couponDiscount({ ...c, type: 'fixed', value: 9999 }, 5000, 0).discount).toBe(5000);
    expect(couponDiscount({ ...c, validUntil: 10 }, 5000, 11).error).toBe('Cupom expirado.');
    expect(couponDiscount({ ...c, maxUses: 1, uses: 1 }, 5000, 0).error).toBe('Cupom esgotado.');
  });
  it('disponibilidade honesta', () => {
    expect(stockOf(p2)).toBe(2);
    expect(stockOf(p2, 'g')).toBe(0);
    expect(availabilityOf(0, 5)).toBe('indisponivel');
    expect(availabilityOf(5, 5)).toBe('ultimas');
    expect(availabilityOf(6, 5)).toBe('em_estoque');
    expect(effectivePrice({ price: 100, promoPrice: 200 })).toBe(100);
  });
});

describe('WhatsApp', () => {
  const msg = buildOrderMessage({
    number: 123,
    items: [
      { name: 'Desinfetante 5L', variantLabel: 'Lavanda', quantity: 2, lineTotal: 4980 },
      { name: 'Capacete de segurança', variantLabel: null, quantity: 1, lineTotal: 2490 },
    ],
    subtotal: 7470, fulfillment: 'entrega', shippingKind: 'gratis', name: 'José', neighborhood: 'Centro',
    city: 'São Paulo', paymentMethod: 'pix',
  });
  it('monta a mensagem no formato combinado', () => {
    expect(msg).toContain('*#0123*');
    expect(msg).toContain('• 2x Desinfetante 5L (Lavanda) — R$ 49,80');
    expect(msg).toContain('*Total dos produtos:* R$ 74,70');
    expect(msg).toContain('*Recebimento:* Entrega — Frete grátis');
    expect(msg).toContain('*Pagamento:* Pix');
    expect(formatOrderNumber(7)).toBe('#0007');
  });
  it('codifica acentos e símbolos no link', () => {
    const link = whatsappLink('5511999998888', msg);
    expect(link.startsWith('https://wa.me/5511999998888?text=')).toBe(true);
    const text = link.split('?text=')[1];
    expect(text).not.toMatch(/[ #\n&?]/);
    expect(text).toContain('%23'); // #
    expect(text).toContain('%C3%A3'); // ã
    expect(decodeURIComponent(text)).toBe(msg);
  });
});

describe('Pix BR Code', () => {
  it('CRC16-CCITT-FALSE', () => {
    expect(crc16('123456789')).toBe('29B1');
    // Exemplo do manual do BCB (Pix estático)
    const base = '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304';
    expect(crc16(base)).toBe('1D3D');
  });
  it('gera payload com valor e CRC válido', () => {
    const p = buildPixPayload({ key: 'loja@exemplo.com', receiverName: 'Loja do Trabalhador', receiverCity: 'São Paulo', amountCents: 7470, txid: 'PED0123' });
    expect(p).toContain('br.gov.bcb.pix');
    expect(p).toContain('540574.70');
    expect(p).toContain('6009SAO PAULO');
    expect(p).toContain('0507PED0123');
    expect(crc16(p.slice(0, -4))).toBe(p.slice(-4));
  });
});

describe('datas em America/Sao_Paulo', () => {
  // 2026-03-04 (quarta) 01:30 UTC = 2026-03-03 22:30 em SP
  const t = Date.UTC(2026, 2, 4, 1, 30);
  it('agrupa pelo dia local', () => {
    expect(dayKey(t)).toBe('2026-03-03');
    expect(startOfDay(t)).toBe(Date.UTC(2026, 2, 3, 3, 0));
    expect(zonedMidnight(2026, 1, 1)).toBe(Date.UTC(2026, 0, 1, 3));
  });
  it('semana começa na segunda', () => {
    expect(startOfWeek(t)).toBe(Date.UTC(2026, 2, 2, 3)); // segunda 02/03
    const sunday = Date.UTC(2026, 2, 8, 15); // domingo 08/03
    expect(startOfWeek(sunday)).toBe(Date.UTC(2026, 2, 2, 3));
  });
  it('mês e ano', () => {
    expect(startOfMonth(t)).toBe(Date.UTC(2026, 2, 1, 3));
    expect(startOfYear(Date.UTC(2026, 0, 1, 2))).toBe(Date.UTC(2025, 0, 1, 3)); // ainda 31/12/2025 em SP
  });
});

describe('CSV', () => {
  it('escapa e evita fórmulas', () => {
    const csv = toCsv([{ a: 'x;y', b: '=SOMA(1)' }]);
    expect(csv).toContain('"x;y"');
    expect(csv).toContain("'=SOMA(1)");
  });
});
