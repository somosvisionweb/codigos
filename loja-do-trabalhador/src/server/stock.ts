// Movimentação de estoque — usada SOMENTE dentro de transações do Firestore.
import type { OrderItem, Product, Variant } from '../lib/types';

export interface StockChange {
  productId: string;
  variants: Variant[];
  stock: number;
}

export interface StockProblem {
  productId: string;
  variantId: string | null;
  name: string;
  available: number;
  message: string;
}

function label(item: Pick<OrderItem, 'name' | 'variantLabel'>) {
  return item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name;
}

/**
 * Aplica um movimento de estoque (sign = -1 baixa, +1 devolve) sobre os produtos lidos na transação.
 * Na baixa, nunca deixa estoque negativo: retorna a lista de problemas e não altera nada.
 */
export function applyStockMovement(
  items: Pick<OrderItem, 'productId' | 'variantId' | 'quantity' | 'name' | 'variantLabel'>[],
  products: Map<string, Product>,
  sign: 1 | -1,
): { changes: StockChange[]; problems: StockProblem[]; skipped: string[] } {
  const working = new Map<string, { variants: Variant[]; stock: number }>();
  const problems: StockProblem[] = [];
  const skipped: string[] = [];

  for (const item of items) {
    const p = products.get(item.productId);
    if (!p) {
      if (sign === -1) {
        problems.push({ productId: item.productId, variantId: item.variantId, name: label(item), available: 0, message: `${label(item)} não existe mais no catálogo.` });
      } else {
        skipped.push(`${label(item)} (produto excluído)`);
      }
      continue;
    }
    const state = working.get(p.id) ?? { variants: (p.variants ?? []).map((v) => ({ ...v })), stock: p.stock ?? 0 };
    working.set(p.id, state);
    if (state.variants.length > 0) {
      const v = state.variants.find((x) => x.id === item.variantId);
      if (!v) {
        if (sign === -1) {
          problems.push({ productId: p.id, variantId: item.variantId, name: label(item), available: 0, message: `A opção de ${label(item)} não existe mais.` });
        } else {
          skipped.push(`${label(item)} (opção excluída)`);
        }
        continue;
      }
      const next = v.stock + sign * item.quantity;
      if (next < 0) {
        problems.push({ productId: p.id, variantId: v.id, name: label(item), available: Math.max(0, v.stock), message: `${label(item)}: só há ${Math.max(0, v.stock)} em estoque.` });
        continue;
      }
      v.stock = next;
    } else {
      const next = state.stock + sign * item.quantity;
      if (next < 0) {
        problems.push({ productId: p.id, variantId: null, name: label(item), available: Math.max(0, state.stock), message: `${label(item)}: só há ${Math.max(0, state.stock)} em estoque.` });
        continue;
      }
      state.stock = next;
    }
  }

  if (problems.length) return { changes: [], problems, skipped };
  const changes: StockChange[] = [...working.entries()].map(([productId, s]) => ({
    productId,
    variants: s.variants,
    // Com variantes, o campo stock do produto espelha a soma (facilita listagens e alertas).
    stock: s.variants.length ? s.variants.reduce((sum, v) => sum + v.stock, 0) : s.stock,
  }));
  return { changes, problems, skipped };
}
