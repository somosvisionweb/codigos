import { effectivePrice, findVariant, stockOf } from './catalog';
import type { CartLine, Cents, Coupon, OrderItem, Product, ShippingKind } from './types';

export const MAX_ITEMS_PER_ORDER = 40;
export const MAX_QTY_PER_ITEM = 99;

export interface LineError {
  productId: string;
  variantId: string | null;
  name: string;
  reason: 'nao_encontrado' | 'inativo' | 'opcao_obrigatoria' | 'opcao_invalida' | 'sem_estoque' | 'estoque_insuficiente';
  available?: number;
  message: string;
}

export interface CalcResult {
  items: OrderItem[];
  subtotal: Cents;
  discount: Cents;
  shipping: Cents;
  total: Cents;
  errors: LineError[];
  couponError?: string;
}

/** Junta linhas repetidas (mesmo produto + opção) somando as quantidades. */
export function mergeLines(lines: CartLine[]): CartLine[] {
  const map = new Map<string, CartLine>();
  for (const l of lines) {
    const key = `${l.productId}::${l.variantId ?? ''}`;
    const prev = map.get(key);
    if (prev) prev.quantity += l.quantity;
    else map.set(key, { ...l, variantId: l.variantId ?? null });
  }
  return [...map.values()];
}

/** Calcula desconto de cupom; retorna erro legível se não puder ser aplicado. */
export function couponDiscount(
  coupon: Coupon | null | undefined,
  subtotal: Cents,
  now: number,
): { discount: Cents; error?: string } {
  if (!coupon) return { discount: 0 };
  if (!coupon.active) return { discount: 0, error: 'Cupom inativo.' };
  if (coupon.validUntil && now > coupon.validUntil) return { discount: 0, error: 'Cupom expirado.' };
  if (coupon.maxUses != null && coupon.uses >= coupon.maxUses) return { discount: 0, error: 'Cupom esgotado.' };
  if (subtotal < (coupon.minOrder ?? 0)) return { discount: 0, error: 'Pedido abaixo do valor mínimo do cupom.' };
  const raw = coupon.type === 'percent' ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  return { discount: Math.max(0, Math.min(subtotal, raw)) };
}

/**
 * Recalcula o pedido a partir dos produtos do banco. Ignora qualquer preço vindo do cliente.
 * `products` deve conter os produtos referenciados pelas linhas (pode faltar algum).
 */
export function calculateOrder(
  lines: CartLine[],
  products: Map<string, Product>,
  opts: { shippingKind: ShippingKind; coupon?: Coupon | null; now?: number } ,
): CalcResult {
  const items: OrderItem[] = [];
  const errors: LineError[] = [];

  for (const line of mergeLines(lines)) {
    const p = products.get(line.productId);
    const base = { productId: line.productId, variantId: line.variantId ?? null };
    if (!p) {
      errors.push({ ...base, name: 'Produto', reason: 'nao_encontrado', message: 'Produto não encontrado.' });
      continue;
    }
    if (!p.active) {
      errors.push({ ...base, name: p.name, reason: 'inativo', message: `${p.name} não está mais disponível.` });
      continue;
    }
    const hasVariants = (p.variants ?? []).length > 0;
    let variantLabel: string | null = null;
    if (hasVariants) {
      if (!line.variantId) {
        errors.push({ ...base, name: p.name, reason: 'opcao_obrigatoria', message: `Escolha uma opção para ${p.name}.` });
        continue;
      }
      const v = findVariant(p, line.variantId);
      if (!v) {
        errors.push({ ...base, name: p.name, reason: 'opcao_invalida', message: `A opção escolhida de ${p.name} não existe mais.` });
        continue;
      }
      variantLabel = v.label;
    } else if (line.variantId) {
      errors.push({ ...base, name: p.name, reason: 'opcao_invalida', message: `${p.name} não tem opções.` });
      continue;
    }
    const available = stockOf(p, hasVariants ? line.variantId : null);
    const label = variantLabel ? `${p.name} (${variantLabel})` : p.name;
    if (available <= 0) {
      errors.push({ ...base, name: label, reason: 'sem_estoque', available: 0, message: `${label} está sem estoque.` });
      continue;
    }
    if (line.quantity > available) {
      errors.push({
        ...base,
        name: label,
        reason: 'estoque_insuficiente',
        available,
        message: `${label}: só temos ${available} ${available === 1 ? 'unidade' : 'unidades'}.`,
      });
      continue;
    }
    const unitPrice = effectivePrice(p);
    items.push({
      productId: p.id,
      variantId: hasVariants ? line.variantId : null,
      name: p.name,
      variantLabel,
      unitPrice,
      quantity: line.quantity,
      lineTotal: unitPrice * line.quantity,
    });
  }

  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const { discount, error: couponError } = couponDiscount(opts.coupon, subtotal, opts.now ?? Date.now());
  // Frete: grátis na região, a combinar fora dela (não calculamos frete) — valor 0 no total.
  const shipping = 0;
  const total = Math.max(0, subtotal - discount + shipping);
  return { items, subtotal, discount, shipping, total, errors, couponError };
}
