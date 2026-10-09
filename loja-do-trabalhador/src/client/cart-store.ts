// Carrinho no navegador (localStorage, chave versionada). Preços aqui são só para exibição:
// o servidor recalcula tudo em create-order.
import type { CartLine } from '../lib/types';

export const CART_KEY = 'ldt_cart_v1';
export const LAST_ORDER_KEY = 'ldt_last_order_v1';
export const MAX_QTY = 99;

export interface StoredLine extends CartLine {
  name: string;
  variantLabel: string | null;
  price: number; // centavos, para exibição
  image: string;
  slug: string;
  unit?: string;
  warning?: string | null; // aviso após conferência com o servidor
  info?: string | null;
}

type Listener = (lines: StoredLine[]) => void;
const listeners = new Set<Listener>();

function read(): StoredLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!data || data.v !== 1 || !Array.isArray(data.lines)) return [];
    return data.lines
      .filter((l: StoredLine) => l && typeof l.productId === 'string' && Number.isFinite(l.quantity))
      .map((l: StoredLine) => ({ ...l, quantity: clampQty(l.quantity) }));
  } catch {
    return [];
  }
}

let lines: StoredLine[] = typeof window !== 'undefined' ? read() : [];

function write() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify({ v: 1, lines }));
  } catch {
    /* modo privado/sem espaço: segue só em memória */
  }
  for (const fn of listeners) fn(lines);
}

export function clampQty(n: number): number {
  const v = Math.floor(Number(n) || 1);
  return Math.min(MAX_QTY, Math.max(1, v));
}

export const keyOf = (l: Pick<CartLine, 'productId' | 'variantId'>) => `${l.productId}::${l.variantId ?? ''}`;

export const cart = {
  get lines() {
    return lines;
  },
  count() {
    return lines.reduce((s, l) => s + l.quantity, 0);
  },
  subtotal() {
    return lines.reduce((s, l) => s + l.price * l.quantity, 0);
  },
  add(line: Omit<StoredLine, 'quantity'> & { quantity?: number }) {
    const key = keyOf(line);
    const existing = lines.find((l) => keyOf(l) === key);
    if (existing) {
      existing.quantity = clampQty(existing.quantity + (line.quantity ?? 1));
      existing.price = line.price;
    } else {
      lines = [...lines, { ...line, quantity: clampQty(line.quantity ?? 1) }];
    }
    write();
  },
  setQty(key: string, qty: number) {
    lines = lines.map((l) => (keyOf(l) === key ? { ...l, quantity: clampQty(qty) } : l));
    write();
  },
  remove(key: string) {
    lines = lines.filter((l) => keyOf(l) !== key);
    write();
  },
  clear() {
    lines = [];
    write();
  },
  replace(next: StoredLine[]) {
    lines = next;
    write();
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  reload() {
    lines = read();
    for (const fn of listeners) fn(lines);
  },
};

// Outras abas: mantém o carrinho sincronizado.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CART_KEY) cart.reload();
  });
}

/** Último pedido (para "Repetir último pedido"). */
export function saveLastOrder(items: StoredLine[], number: string) {
  try {
    localStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ v: 1, at: Date.now(), number, items }));
  } catch {
    /* ignora */
  }
}

export function readLastOrder(): { number: string; items: StoredLine[] } | null {
  try {
    const data = JSON.parse(localStorage.getItem(LAST_ORDER_KEY) || 'null');
    if (!data || data.v !== 1 || !Array.isArray(data.items) || !data.items.length) return null;
    return data;
  } catch {
    return null;
  }
}

export interface CatalogInfo {
  active: boolean;
  name?: string;
  slug?: string;
  price?: number;
  image?: string;
  unit?: string;
  availability?: 'em_estoque' | 'ultimas' | 'indisponivel';
  left?: number | null;
  variants?: { id: string; label: string; availability: string; left: number | null }[];
}

/** Confere preços e disponibilidade atuais com o servidor e anota avisos nas linhas. */
export async function refreshCart(): Promise<{ changed: boolean; maintenance: boolean }> {
  if (!lines.length) return { changed: false, maintenance: false };
  const ids = [...new Set(lines.map((l) => l.productId))].join(',');
  const res = await fetch(`/api/catalog?ids=${encodeURIComponent(ids)}`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('catalog');
  const data = (await res.json()) as { maintenance: boolean; products: Record<string, CatalogInfo> };
  let changed = false;
  const next = lines.map((l) => {
    const info = data.products[l.productId];
    const line: StoredLine = { ...l, warning: null, info: null };
    if (!info || !info.active) {
      line.warning = 'Este produto não está mais disponível. Remova do carrinho.';
      changed = true;
      return line;
    }
    if (typeof info.price === 'number' && info.price !== l.price) {
      line.info = `Preço atualizado: era ${fmt(l.price)}, agora ${fmt(info.price)}.`;
      line.price = info.price;
      changed = true;
    }
    if (info.name) line.name = info.name;
    if (info.image) line.image = info.image;
    let avail = info.availability;
    let left = info.left;
    if (info.variants && info.variants.length) {
      const v = info.variants.find((x) => x.id === l.variantId);
      if (!v) {
        line.warning = 'A opção escolhida não existe mais. Remova e escolha de novo.';
        changed = true;
        return line;
      }
      avail = v.availability as CatalogInfo['availability'];
      left = v.left;
    }
    if (avail === 'indisponivel') {
      line.warning = 'Indisponível no momento. Remova do carrinho ou chame no WhatsApp.';
      changed = true;
    } else if (left != null && l.quantity > left) {
      line.warning = `Só temos ${left} ${left === 1 ? 'unidade' : 'unidades'}. Ajuste a quantidade.`;
      changed = true;
    }
    return line;
  });
  lines = next;
  write();
  return { changed, maintenance: data.maintenance };
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export function fmt(cents: number): string {
  return brl.format(cents / 100).replace(/\u00a0/g, ' ');
}
