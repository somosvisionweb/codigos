import { formatBRL } from './money';
import { shippingLabel } from './shipping';
import type { Fulfillment, OrderItem, PaymentMethod, ShippingKind } from './types';

export const paymentLabel: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
};

export function formatOrderNumber(n: number): string {
  return '#' + String(n).padStart(4, '0');
}

/** Link wa.me com texto codificado (acentos, *, quebras de linha, #). */
export function whatsappLink(phone: string, text: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  const base = digits && !digits.startsWith('TODO') ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

export interface OrderMessageInput {
  number: number | null; // null = pedido não registrado (plano B)
  items: Pick<OrderItem, 'name' | 'variantLabel' | 'quantity' | 'lineTotal'>[];
  subtotal: number;
  discount?: number;
  total?: number;
  fulfillment: Fulfillment;
  shippingKind: ShippingKind;
  name: string;
  neighborhood: string;
  city: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export function buildOrderMessage(o: OrderMessageInput): string {
  const lines: string[] = [];
  if (o.number != null) {
    lines.push(`Olá, Loja do Trabalhador! Acabei de fazer o pedido *${formatOrderNumber(o.number)}* pelo site:`);
  } else {
    lines.push('Olá, Loja do Trabalhador! Quero fazer este pedido (o site não conseguiu registrar, estou enviando por aqui):');
  }
  lines.push('', '*Itens*');
  for (const i of o.items) {
    const opt = i.variantLabel ? ` (${i.variantLabel})` : '';
    lines.push(`• ${i.quantity}x ${i.name}${opt} — ${formatBRL(i.lineTotal)}`);
  }
  lines.push('', `*Total dos produtos:* ${formatBRL(o.subtotal)}`);
  if (o.discount && o.discount > 0) {
    lines.push(`*Desconto:* -${formatBRL(o.discount)}`);
    lines.push(`*Total:* ${formatBRL(o.total ?? o.subtotal - o.discount)}`);
  }
  const receb = o.fulfillment === 'retirada' ? 'Retirada na loja' : `Entrega — ${shippingLabel(o.shippingKind)}`;
  lines.push(`*Recebimento:* ${receb}`);
  lines.push(`*Nome:* ${o.name}`);
  lines.push(`*Bairro/Cidade:* ${[o.neighborhood, o.city].filter(Boolean).join(' / ')}`);
  lines.push(`*Pagamento:* ${paymentLabel[o.paymentMethod]}`);
  if (o.notes) lines.push(`*Observações:* ${o.notes}`);
  lines.push('', 'Pode confirmar pra mim, por favor?');
  return lines.join('\n');
}
