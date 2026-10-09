import type { Product, Variant } from './types';

export type Availability = 'em_estoque' | 'ultimas' | 'indisponivel';

export function effectivePrice(p: Pick<Product, 'price' | 'promoPrice'>): number {
  return p.promoPrice != null && p.promoPrice > 0 && p.promoPrice < p.price ? p.promoPrice : p.price;
}

export function hasPromo(p: Pick<Product, 'price' | 'promoPrice'>): boolean {
  return effectivePrice(p) !== p.price;
}

export function findVariant(p: Pick<Product, 'variants'>, variantId: string | null | undefined): Variant | undefined {
  if (!variantId) return undefined;
  return (p.variants ?? []).find((v) => v.id === variantId);
}

/** Estoque disponível do produto (soma das variantes) ou de uma variante específica. */
export function stockOf(p: Pick<Product, 'variants' | 'stock'>, variantId?: string | null): number {
  const variants = p.variants ?? [];
  if (variants.length === 0) return Math.max(0, p.stock ?? 0);
  if (variantId) return Math.max(0, findVariant(p, variantId)?.stock ?? 0);
  return variants.reduce((sum, v) => sum + Math.max(0, v.stock ?? 0), 0);
}

export function availabilityOf(stock: number, threshold: number): Availability {
  if (stock <= 0) return 'indisponivel';
  if (stock <= Math.max(0, threshold)) return 'ultimas';
  return 'em_estoque';
}

export const availabilityLabel: Record<Availability, string> = {
  em_estoque: 'Em estoque',
  ultimas: 'Últimas unidades',
  indisponivel: 'Indisponível',
};

export function isLowStock(p: Pick<Product, 'variants' | 'stock' | 'minStock'>): boolean {
  return stockOf(p) <= (p.minStock ?? 0);
}

export function coverImage(p: Pick<Product, 'images' | 'placeholder' | 'slug'>, thumb = false): string {
  const first = p.images?.[0];
  if (first) return (thumb && first.thumb) || first.url;
  return p.placeholder || `/images/produtos/${p.slug}.webp`;
}
