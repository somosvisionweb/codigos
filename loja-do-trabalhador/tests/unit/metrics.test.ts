import { describe, expect, it } from 'vitest';
import { summarize, dailySeries, topProducts } from '../../src/admin/metrics';
import type { Order } from '../../src/lib/types';

const o = (over: Partial<Order>): Order => ({
  id: 'x', number: 1, source: 'site', items: [{ productId: 'a', variantId: null, name: 'A', variantLabel: null, unitPrice: 1000, quantity: 1, lineTotal: 1000 }],
  subtotal: 1000, discount: 0, shipping: 0, shippingKind: 'gratis', total: 1000, customer: { name: 'C', phone: '55', type: 'PF' },
  fulfillment: 'retirada', address: { neighborhood: '', city: '' }, paymentMethod: 'pix', paymentStatus: 'pendente', status: 'novo',
  history: [], notes: '', stockDeducted: true, reviewToken: 't', deletedAt: null, createdAt: Date.UTC(2026, 2, 3, 15), updatedAt: 0, createdBy: 'site', ...over,
});

describe('métricas', () => {
  const list = [
    o({ total: 1000, paymentStatus: 'pago' }),
    o({ total: 2000 }),
    o({ total: 5000, status: 'cancelado' }),
    o({ total: 7000, deletedAt: 1 }),
  ];
  it('ignora cancelados e excluídos; separa recebido e a receber', () => {
    const s = summarize(list, 0);
    expect(s).toEqual({ sold: 3000, received: 1000, receivable: 2000, count: 2, avgTicket: 1500 });
  });
  it('série diária no fuso de SP', () => {
    const late = o({ total: 500, createdAt: Date.UTC(2026, 2, 4, 2) }); // 23h do dia 03 em SP
    const series = dailySeries([...list, late], 3, Date.UTC(2026, 2, 4, 15));
    expect(series.map((d) => d.key)).toEqual(['2026-03-02', '2026-03-03', '2026-03-04']);
    expect(series[1].total).toBe(3500);
  });
  it('top produtos por faturamento', () => {
    expect(topProducts(list, 0)[0]).toMatchObject({ productId: 'a', quantity: 2, revenue: 2000 });
  });
});
