import { normalizeText } from './text';
import type { Fulfillment, ShippingKind } from './types';

/** Verifica se o bairro ou a cidade estão na lista de frete grátis (sem acento/maiúscula). */
export function isFreeShippingArea(
  areas: string[] | null | undefined,
  neighborhood: string | null | undefined,
  city: string | null | undefined,
): boolean {
  const list = (areas ?? []).map(normalizeText).filter((a) => a && !a.startsWith('todo_'));
  if (list.length === 0) return false;
  const n = normalizeText(neighborhood);
  const c = normalizeText(city);
  return list.some((a) => (n && a === n) || (c && a === c));
}

export function shippingKindFor(
  fulfillment: Fulfillment,
  areas: string[] | null | undefined,
  neighborhood: string | null | undefined,
  city: string | null | undefined,
): ShippingKind {
  if (fulfillment === 'retirada') return 'retirada';
  return isFreeShippingArea(areas, neighborhood, city) ? 'gratis' : 'a_combinar';
}

export function shippingLabel(kind: ShippingKind): string {
  switch (kind) {
    case 'gratis':
      return 'Frete grátis';
    case 'retirada':
      return 'Retirada na loja';
    default:
      return 'Frete a combinar no WhatsApp';
  }
}
