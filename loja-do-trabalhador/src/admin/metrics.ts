// Cálculos do dashboard e relatórios (puros, testáveis).
import { countsForRevenue } from '../lib/orders';
import { addDays, dayKey, startOfDay, startOfMonth, startOfWeek, startOfYear } from '../lib/dates';
import type { Order } from '../lib/types';

export interface Summary {
  sold: number;
  received: number;
  receivable: number;
  count: number;
  avgTicket: number;
}

export function summarize(orders: Order[], from: number, to = Infinity): Summary {
  const list = orders.filter((o) => countsForRevenue(o) && o.createdAt >= from && o.createdAt < to);
  const sold = list.reduce((s, o) => s + o.total, 0);
  const received = list.filter((o) => o.paymentStatus === 'pago').reduce((s, o) => s + o.total, 0);
  const receivable = list.filter((o) => o.paymentStatus === 'pendente').reduce((s, o) => s + o.total, 0);
  return { sold, received, receivable, count: list.length, avgTicket: list.length ? Math.round(sold / list.length) : 0 };
}

export function periodStarts(now = Date.now()) {
  return { today: startOfDay(now), week: startOfWeek(now), month: startOfMonth(now), year: startOfYear(now) };
}

/** Vendas por dia nos últimos N dias (fuso de São Paulo). */
export function dailySeries(orders: Order[], days = 30, now = Date.now()): { key: string; start: number; total: number; count: number }[] {
  const first = addDays(startOfDay(now), -(days - 1));
  const out = Array.from({ length: days }, (_, i) => {
    const start = addDays(first, i);
    return { key: dayKey(start), start, total: 0, count: 0 };
  });
  const idx = new Map(out.map((d, i) => [d.key, i]));
  for (const o of orders) {
    if (!countsForRevenue(o) || o.createdAt < first) continue;
    const i = idx.get(dayKey(o.createdAt));
    if (i != null) {
      out[i].total += o.total;
      out[i].count++;
    }
  }
  return out;
}

export function topProducts(orders: Order[], from: number, to = Infinity, limit = 5) {
  const map = new Map<string, { productId: string; name: string; quantity: number; revenue: number }>();
  for (const o of orders) {
    if (!countsForRevenue(o) || o.createdAt < from || o.createdAt >= to) continue;
    for (const i of o.items) {
      const cur = map.get(i.productId) ?? { productId: i.productId, name: i.name, quantity: 0, revenue: 0 };
      cur.quantity += i.quantity;
      cur.revenue += i.lineTotal;
      map.set(i.productId, cur);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}
