import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { me } from './store';
import { statusLabel, paymentStatusLabel } from '../lib/orders';
import type { HistoryEntry, Order, OrderStatus, PaymentStatus } from '../lib/types';

function entry(action: string, note?: string): HistoryEntry {
  return { at: Date.now(), by: me.value?.id ?? '?', byName: me.value?.name ?? '', action, ...(note ? { note } : {}) };
}

export async function setStatus(order: Order, status: OrderStatus) {
  await updateDoc(doc(db, `orders/${order.id}`), {
    status,
    updatedAt: Date.now(),
    history: arrayUnion(entry(`status:${status}`, statusLabel[status])),
  });
}

export async function setPayment(order: Order, paymentStatus: PaymentStatus) {
  await updateDoc(doc(db, `orders/${order.id}`), {
    paymentStatus,
    updatedAt: Date.now(),
    history: arrayUnion(entry(`pagamento:${paymentStatus}`, paymentStatusLabel[paymentStatus])),
  });
}

export function historyLabel(h: HistoryEntry): string {
  if (h.action.startsWith('status:')) return `Status: ${statusLabel[h.action.slice(7) as OrderStatus] ?? h.action}`;
  if (h.action.startsWith('pagamento:')) return `Pagamento: ${paymentStatusLabel[h.action.slice(10) as PaymentStatus] ?? h.action}`;
  const map: Record<string, string> = {
    criado: 'Pedido criado', cancelado: 'Cancelado', reaberto: 'Reaberto', excluido: 'Enviado para a lixeira',
    restaurado: 'Restaurado da lixeira', anonimizado: 'Dados anonimizados', nota: 'Observação interna',
  };
  return map[h.action] ?? h.action;
}
