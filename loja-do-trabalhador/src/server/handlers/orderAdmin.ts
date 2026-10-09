// Ações de pedido que mexem em estoque ou totais de cliente — exclusivas do servidor.
//  - cancel-order: devolve o estoque (idempotente via stockDeducted).
//  - reopen-order: baixa o estoque de novo, se houver saldo (idempotente).
//  - trash-order (excluir/restaurar), reset-orders e empty-trash: NÃO mexem no estoque.
import { z } from 'zod';
import { db } from '../firebase';
import { HttpError, json, errorResponse, readJson, zodFields } from '../http';
import { requireStaff, requireRecentLogin, type Staff } from '../auth';
import { applyStockMovement } from '../stock';
import { recomputeCustomer, writeAudit } from '../customers';
import { StockError } from './createOrder';
import { formatOrderNumber } from '../../lib/whatsapp';
import type { HistoryEntry, Order, Product } from '../../lib/types';

const BATCH = 400;

function entry(staff: Staff, action: string, note?: string): HistoryEntry {
  return { at: Date.now(), by: staff.uid, byName: staff.name, action, ...(note ? { note } : {}) };
}

async function loadProducts(tx: FirebaseFirestore.Transaction, ids: string[]): Promise<Map<string, Product>> {
  const fs = db();
  const map = new Map<string, Product>();
  if (!ids.length) return map;
  const snaps = await tx.getAll(...ids.map((id) => fs.doc(`products/${id}`)));
  for (const s of snaps) if (s.exists) map.set(s.id, { id: s.id, ...(s.data() as Omit<Product, 'id'>) });
  return map;
}

export async function cancelOrder(orderId: string, staff: Staff, reason = ''): Promise<{ changed: boolean; skipped: string[] }> {
  const fs = db();
  const ref = fs.doc(`orders/${orderId}`);
  const out = await fs.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpError(404, 'nao_encontrado', 'Pedido não encontrado.');
    const order = snap.data() as Order;
    if (order.status === 'cancelado') return { changed: false, skipped: [] as string[], phone: order.customer?.phone, number: order.number };
    let skipped: string[] = [];
    const now = Date.now();
    if (order.stockDeducted) {
      const products = await loadProducts(tx, [...new Set(order.items.map((i) => i.productId))]);
      const mv = applyStockMovement(order.items, products, 1);
      skipped = mv.skipped;
      for (const c of mv.changes) tx.update(fs.doc(`products/${c.productId}`), { variants: c.variants, stock: c.stock, updatedAt: now });
    }
    const note = [reason, skipped.length ? `Sem devolução: ${skipped.join(', ')}` : ''].filter(Boolean).join(' · ');
    tx.update(ref, {
      status: 'cancelado',
      stockDeducted: false,
      updatedAt: now,
      history: [...(order.history ?? []), entry(staff, 'cancelado', note || (order.stockDeducted ? 'Estoque devolvido' : undefined))],
    });
    return { changed: true, skipped, phone: order.customer?.phone, number: order.number };
  });
  if (out.changed) {
    await recomputeCustomer(out.phone);
    await writeAudit({ by: staff.uid, byName: staff.name, action: 'pedido.cancelar', target: orderId, summary: `Pedido ${formatOrderNumber(out.number)} cancelado (estoque devolvido)` });
  }
  return { changed: out.changed, skipped: out.skipped };
}

export async function reopenOrder(orderId: string, staff: Staff): Promise<{ changed: boolean }> {
  const fs = db();
  const ref = fs.doc(`orders/${orderId}`);
  const out = await fs.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpError(404, 'nao_encontrado', 'Pedido não encontrado.');
    const order = snap.data() as Order;
    if (order.status !== 'cancelado') return { changed: false, phone: order.customer?.phone, number: order.number };
    if (order.deletedAt) throw new HttpError(409, 'na_lixeira', 'Restaure o pedido da lixeira antes de reabrir.');
    const now = Date.now();
    if (!order.stockDeducted) {
      const products = await loadProducts(tx, [...new Set(order.items.map((i) => i.productId))]);
      const mv = applyStockMovement(order.items, products, -1);
      if (mv.problems.length) throw new StockError(mv.problems);
      for (const c of mv.changes) tx.update(fs.doc(`products/${c.productId}`), { variants: c.variants, stock: c.stock, updatedAt: now });
    }
    tx.update(ref, {
      status: 'novo',
      stockDeducted: true,
      updatedAt: now,
      history: [...(order.history ?? []), entry(staff, 'reaberto', 'Estoque baixado novamente')],
    });
    return { changed: true, phone: order.customer?.phone, number: order.number };
  });
  if (out.changed) {
    await recomputeCustomer(out.phone);
    await writeAudit({ by: staff.uid, byName: staff.name, action: 'pedido.reabrir', target: orderId, summary: `Pedido ${formatOrderNumber(out.number)} reaberto (estoque baixado)` });
  }
  return { changed: out.changed };
}

/** Excluir (lixeira) ou restaurar. Não mexe no estoque. */
export async function trashOrder(orderId: string, staff: Staff, action: 'delete' | 'restore'): Promise<{ changed: boolean }> {
  const fs = db();
  const ref = fs.doc(`orders/${orderId}`);
  const out = await fs.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpError(404, 'nao_encontrado', 'Pedido não encontrado.');
    const order = snap.data() as Order;
    const inTrash = Boolean(order.deletedAt);
    if ((action === 'delete' && inTrash) || (action === 'restore' && !inTrash)) return { changed: false, phone: order.customer?.phone, number: order.number };
    const now = Date.now();
    tx.update(ref, {
      deletedAt: action === 'delete' ? now : null,
      updatedAt: now,
      history: [...(order.history ?? []), entry(staff, action === 'delete' ? 'excluido' : 'restaurado', 'Estoque não alterado')],
    });
    return { changed: true, phone: order.customer?.phone, number: order.number };
  });
  if (out.changed) {
    await recomputeCustomer(out.phone);
    await writeAudit({
      by: staff.uid, byName: staff.name, action: action === 'delete' ? 'pedido.excluir' : 'pedido.restaurar', target: orderId,
      summary: `Pedido ${formatOrderNumber(out.number)} ${action === 'delete' ? 'enviado para a lixeira' : 'restaurado da lixeira'}`,
    });
  }
  return { changed: out.changed };
}

/** "Zerar tudo": move todos os pedidos ativos para a lixeira (lotes de 400). Não mexe no estoque. */
export async function resetOrders(staff: Staff): Promise<{ moved: number }> {
  const fs = db();
  const snap = await fs.collection('orders').where('deletedAt', '==', null).get();
  const now = Date.now();
  let moved = 0;
  for (let i = 0; i < snap.docs.length; i += BATCH) {
    const batch = fs.batch();
    for (const d of snap.docs.slice(i, i + BATCH)) {
      const o = d.data() as Order;
      batch.update(d.ref, {
        deletedAt: now,
        updatedAt: now,
        history: [...(o.history ?? []), entry(staff, 'excluido', 'Zerar tudo — estoque não alterado')],
      });
      moved++;
    }
    await batch.commit();
  }
  // Com todos os pedidos na lixeira, os totais dos clientes zeram.
  const customers = await fs.collection('customers').get();
  for (let i = 0; i < customers.docs.length; i += BATCH) {
    const batch = fs.batch();
    for (const d of customers.docs.slice(i, i + BATCH)) {
      batch.update(d.ref, { ordersCount: 0, totalSpent: 0, lastOrderAt: null, lastOrderId: null, updatedAt: now });
    }
    await batch.commit();
  }
  await writeAudit({ by: staff.uid, byName: staff.name, action: 'pedidos.zerar', target: 'orders', summary: `${moved} pedidos movidos para a lixeira (backup exportado antes)` });
  return { moved };
}

/** Esvaziar lixeira: apaga definitivamente os pedidos excluídos. */
export async function emptyTrash(staff: Staff): Promise<{ deleted: number }> {
  const fs = db();
  const snap = await fs.collection('orders').where('deletedAt', '>', 0).get();
  let deleted = 0;
  for (let i = 0; i < snap.docs.length; i += BATCH) {
    const batch = fs.batch();
    for (const d of snap.docs.slice(i, i + BATCH)) {
      batch.delete(d.ref);
      deleted++;
    }
    await batch.commit();
  }
  await writeAudit({ by: staff.uid, byName: staff.name, action: 'lixeira.esvaziar', target: 'orders', summary: `${deleted} pedidos apagados definitivamente` });
  return { deleted };
}

/** LGPD: remove dados pessoais do cliente e dos pedidos dele; mantém valores para o faturamento. */
export async function anonymizeCustomer(phone: string, staff: Staff): Promise<{ orders: number }> {
  const fs = db();
  const ref = fs.doc(`customers/${phone}`);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpError(404, 'nao_encontrado', 'Cliente não encontrado.');
  const orders = await fs.collection('orders').where('customer.phone', '==', phone).get();
  const now = Date.now();
  for (let i = 0; i < orders.docs.length; i += BATCH) {
    const batch = fs.batch();
    for (const d of orders.docs.slice(i, i + BATCH)) {
      const o = d.data() as Order;
      batch.update(d.ref, {
        customer: { name: 'Cliente anonimizado', phone: '', type: o.customer?.type ?? 'PF', company: null, email: null },
        address: { neighborhood: '', city: o.address?.city ?? '', street: null, complement: null },
        notes: '',
        updatedAt: now,
        history: [...(o.history ?? []), entry(staff, 'anonimizado', 'Dados pessoais removidos (LGPD)')],
      });
    }
    await batch.commit();
  }
  await ref.delete();
  await writeAudit({ by: staff.uid, byName: staff.name, action: 'cliente.anonimizar', target: 'cliente', summary: `Cliente anonimizado (${orders.size} pedidos mantidos sem dados pessoais)` });
  return { orders: orders.size };
}

// ---------------- HTTP ----------------

const idSchema = z.object({ orderId: z.string().min(1).max(64), reason: z.string().max(200).optional() });
const trashSchema = z.object({ orderId: z.string().min(1).max(64), action: z.enum(['delete', 'restore']) });
const confirmSchema = (word: string) => z.object({ confirm: z.literal(word, { message: `Digite ${word} para confirmar.` }) });
const anonSchema = z.object({ phone: z.string().regex(/^55\d{10,11}$/), confirm: z.literal('ANONIMIZAR') });

async function parse<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) throw new HttpError(400, 'validacao', 'Dados inválidos.', { fields: zodFields(parsed.error) });
  return parsed.data;
}

export async function handleCancel(request: Request) {
  try {
    const staff = await requireStaff(request, ['admin']);
    const { orderId, reason } = await parse(request, idSchema);
    return json({ ok: true, ...(await cancelOrder(orderId, staff, reason)) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function handleReopen(request: Request) {
  try {
    const staff = await requireStaff(request, ['admin']);
    const { orderId } = await parse(request, idSchema);
    return json({ ok: true, ...(await reopenOrder(orderId, staff)) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function handleTrash(request: Request) {
  try {
    const staff = await requireStaff(request, ['admin']);
    const { orderId, action } = await parse(request, trashSchema);
    return json({ ok: true, ...(await trashOrder(orderId, staff, action)) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function handleReset(request: Request) {
  try {
    const staff = await requireStaff(request, ['admin']);
    requireRecentLogin(staff);
    await parse(request, confirmSchema('ZERAR'));
    return json({ ok: true, ...(await resetOrders(staff)) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function handleEmptyTrash(request: Request) {
  try {
    const staff = await requireStaff(request, ['admin']);
    requireRecentLogin(staff);
    await parse(request, confirmSchema('ESVAZIAR'));
    return json({ ok: true, ...(await emptyTrash(staff)) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function handleAnonymize(request: Request) {
  try {
    const staff = await requireStaff(request, ['admin']);
    const { phone } = await parse(request, anonSchema);
    return json({ ok: true, ...(await anonymizeCustomer(phone, staff)) });
  } catch (e) {
    return errorResponse(e);
  }
}
