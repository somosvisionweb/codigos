// Utilidades dos testes E2E (falam direto com os emuladores via firebase-admin).
import { db, adminAuth } from '../../src/server/firebase';
import type { Product, Order } from '../../src/lib/types';

export const ADMIN = { email: 'dono@exemplo.com', password: 'senha-teste-123' };
export const SELLER = { email: 'vendedor@exemplo.com', password: 'senha-teste-456' };

export async function productStock(id: string, variantId?: string): Promise<number> {
  const p = (await db().doc(`products/${id}`).get()).data() as Product;
  return variantId ? p.variants.find((v) => v.id === variantId)!.stock : p.stock;
}

export async function setStock(id: string, stock: number, variantId?: string) {
  const ref = db().doc(`products/${id}`);
  const p = (await ref.get()).data() as Product;
  if (variantId) {
    const variants = p.variants.map((v) => (v.id === variantId ? { ...v, stock } : v));
    await ref.update({ variants, stock: variants.reduce((s, v) => s + v.stock, 0) });
  } else {
    await ref.update({ stock });
  }
}

export async function orderByNumber(n: number): Promise<Order & { id: string }> {
  const snap = await db().collection('orders').where('number', '==', n).limit(1).get();
  const d = snap.docs[0];
  return { ...(d.data() as Order), id: d.id };
}

export async function lastOrder(): Promise<Order & { id: string }> {
  const snap = await db().collection('orders').orderBy('createdAt', 'desc').limit(1).get();
  const d = snap.docs[0];
  return { ...(d.data() as Order), id: d.id };
}

export { db, adminAuth };
