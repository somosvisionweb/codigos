import type { Order, OrderStatus, PaymentStatus } from './types';

export const statusLabel: Record<OrderStatus, string> = {
  novo: 'Novo',
  confirmado: 'Confirmado',
  separando: 'Separando',
  saiu_entrega: 'Saiu para entrega',
  pronto_retirada: 'Pronto p/ retirada',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  reembolsado: 'Reembolsado',
};

/** Status que não são cancelamento; sequência normal do fluxo. */
export const FLOW: OrderStatus[] = ['novo', 'confirmado', 'separando', 'saiu_entrega', 'pronto_retirada', 'concluido'];

/** Próximos status possíveis a partir do atual (sem incluir cancelamento). */
export function nextStatuses(current: OrderStatus, fulfillment: Order['fulfillment']): OrderStatus[] {
  switch (current) {
    case 'novo':
      return ['confirmado'];
    case 'confirmado':
      return ['separando'];
    case 'separando':
      return [fulfillment === 'retirada' ? 'pronto_retirada' : 'saiu_entrega'];
    case 'saiu_entrega':
    case 'pronto_retirada':
      return ['concluido'];
    default:
      return [];
  }
}

/** Pedido conta no faturamento? (não cancelado e não excluído) */
export function countsForRevenue(o: Pick<Order, 'status' | 'deletedAt'>): boolean {
  return o.status !== 'cancelado' && !o.deletedAt;
}
