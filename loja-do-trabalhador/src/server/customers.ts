import { db } from './firebase';
import { countsForRevenue } from '../lib/orders';
import type { Order } from '../lib/types';

/** Recalcula os totais do cliente a partir dos pedidos (exclui cancelados e da lixeira). */
export async function recomputeCustomer(phone: string | null | undefined): Promise<void> {
  if (!phone) return;
  const ref = db().doc(`customers/${phone}`);
  const snap = await ref.get();
  if (!snap.exists) return;
  const orders = await db().collection('orders').where('customer.phone', '==', phone).get();
  let ordersCount = 0;
  let totalSpent = 0;
  let lastOrderAt: number | null = null;
  let lastOrderId: string | null = null;
  for (const d of orders.docs) {
    const o = d.data() as Order;
    if (!countsForRevenue(o)) continue;
    ordersCount++;
    totalSpent += o.total ?? 0;
    if (!lastOrderAt || o.createdAt > lastOrderAt) {
      lastOrderAt = o.createdAt;
      lastOrderId = d.id;
    }
  }
  await ref.update({ ordersCount, totalSpent, lastOrderAt, lastOrderId, updatedAt: Date.now() });
}

export async function writeAudit(entry: { by: string; byName?: string; action: string; target: string; summary: string }) {
  try {
    await db().collection('auditLog').add({ ...entry, at: Date.now() });
  } catch (e) {
    console.error('[audit] falha ao registrar', e);
  }
}
