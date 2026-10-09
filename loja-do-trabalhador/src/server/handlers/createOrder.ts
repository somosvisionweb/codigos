// create-order — cria pedido do site ou venda manual do painel.
// Invariantes: preço/total/frete recalculados no servidor; estoque baixado na MESMA transação que gera o número;
// estoque nunca negativo; cliente criado/atualizado pelo telefone normalizado; reviewToken aleatório.
import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import QRCode from 'qrcode';
import { db } from '../firebase';
import { HttpError, json, errorResponse, readJson, zodFields, clientIp } from '../http';
import { getStaff, type Staff } from '../auth';
import { checkRateLimit } from '../ratelimit';
import { applyStockMovement } from '../stock';
import { getSettings } from '../repo';
import { calculateOrder, MAX_ITEMS_PER_ORDER, MAX_QTY_PER_ITEM, type LineError } from '../../lib/order-calc';
import { normalizePhone } from '../../lib/phone';
import { cleanText } from '../../lib/text';
import { shippingKindFor } from '../../lib/shipping';
import { buildOrderMessage, whatsappLink, formatOrderNumber } from '../../lib/whatsapp';
import { buildPixPayload, isPixConfigured } from '../../lib/pix';
import type { Coupon, Customer, Order, Product } from '../../lib/types';

const str = (max: number) => z.string().trim().max(max, `Máximo de ${max} caracteres.`);

export const orderSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string().min(1).max(120),
          variantId: z.string().max(120).nullable().optional(),
          quantity: z.number().int('Quantidade inválida.').min(1, 'Quantidade mínima é 1.').max(MAX_QTY_PER_ITEM, `Máximo de ${MAX_QTY_PER_ITEM} por item.`),
        }),
      )
      .min(1, 'Seu carrinho está vazio.')
      .max(MAX_ITEMS_PER_ORDER, `Máximo de ${MAX_ITEMS_PER_ORDER} itens por pedido.`),
    customer: z.object({
      name: str(80).min(2, 'Informe seu nome.'),
      phone: str(30).optional().default(''),
      type: z.enum(['PF', 'PJ']).default('PF'),
      company: str(100).optional().nullable(),
      email: z.union([z.literal(''), z.email('E-mail inválido.').max(120)]).optional().nullable(),
    }),
    fulfillment: z.enum(['entrega', 'retirada'], { message: 'Escolha entrega ou retirada.' }),
    address: z
      .object({
        neighborhood: str(80).optional().default(''),
        city: str(80).optional().default(''),
        street: str(160).optional().nullable(),
        complement: str(120).optional().nullable(),
      })
      .default({ neighborhood: '', city: '' }),
    paymentMethod: z.enum(['pix', 'cartao', 'dinheiro'], { message: 'Escolha a forma de pagamento.' }),
    notes: str(500).optional().default(''),
    couponCode: str(30).optional().nullable(),
    acceptPrivacy: z.boolean().optional(),
    website: z.string().max(200).optional(), // honeypot: precisa vir vazio
    // Somente venda manual (painel):
    source: z.enum(['site', 'manual']).optional(),
    paid: z.boolean().optional(),
  })
  .strip();

export type OrderInput = z.infer<typeof orderSchema>;

export class StockError extends HttpError {
  constructor(public items: { productId: string; variantId: string | null; name: string; available?: number; message: string; reason?: LineError['reason'] }[]) {
    super(409, 'estoque', items.map((i) => i.message).join(' '), { items });
  }
}

export interface CreateOrderResult {
  orderId: string;
  number: number;
  numberLabel: string;
  subtotal: number;
  discount: number;
  total: number;
  shippingKind: Order['shippingKind'];
  items: Order['items'];
  whatsappUrl: string;
  pix: { payload: string; qr: string } | null;
}

/** Núcleo testável (sem HTTP). `staff` presente = venda manual permitida. */
export async function createOrder(input: OrderInput, staff: Staff | null, now = Date.now()): Promise<CreateOrderResult> {
  const manual = input.source === 'manual';
  if (manual && !staff) throw new HttpError(401, 'nao_autenticado', 'Venda manual exige login no painel.');

  const settings = await getSettings();
  if (!manual && settings.maintenanceMode) {
    throw new HttpError(503, 'manutencao', 'O site está em manutenção e não recebe pedidos agora. Chame no WhatsApp.');
  }

  // ---- Validações de negócio de entrada
  const fields: Record<string, string> = {};
  const phone = normalizePhone(input.customer.phone);
  if (!manual && !phone) fields['customer.phone'] = 'Informe um telefone com DDD.';
  if (manual && input.customer.phone && !phone) fields['customer.phone'] = 'Telefone inválido.';
  if (input.customer.type === 'PJ' && !input.customer.company?.trim() && !manual) fields['customer.company'] = 'Informe o nome da empresa.';
  if (!manual) {
    if (!input.address.neighborhood?.trim()) fields['address.neighborhood'] = 'Informe o bairro.';
    if (!input.address.city?.trim()) fields['address.city'] = 'Informe a cidade.';
    if (input.acceptPrivacy !== true) fields.acceptPrivacy = 'É preciso aceitar a política de privacidade.';
  }
  if (input.fulfillment === 'entrega' && !input.address.street?.trim()) fields['address.street'] = 'Informe rua e número para a entrega.';
  if (Object.keys(fields).length) throw new HttpError(400, 'validacao', 'Confira os campos destacados.', { fields });

  const customer = {
    name: cleanText(input.customer.name, 80),
    phone,
    type: input.customer.type,
    company: input.customer.type === 'PJ' ? cleanText(input.customer.company, 100) || null : null,
    email: input.customer.email ? cleanText(input.customer.email, 120).toLowerCase() : null,
  };
  const address = {
    neighborhood: cleanText(input.address.neighborhood, 80),
    city: cleanText(input.address.city, 80),
    street: input.fulfillment === 'entrega' ? cleanText(input.address.street, 160) : null,
    complement: input.fulfillment === 'entrega' ? cleanText(input.address.complement, 120) || null : null,
  };
  const shippingKind = shippingKindFor(input.fulfillment, settings.freeShippingAreas, address.neighborhood, address.city);
  const couponCode = input.couponCode?.trim().toUpperCase() || null;
  const lines = input.items.map((i) => ({ productId: i.productId, variantId: i.variantId ?? null, quantity: i.quantity }));

  const fs = db();
  const orderRef = fs.collection('orders').doc();
  const reviewToken = randomBytes(24).toString('base64url');

  const result = await fs.runTransaction(async (tx) => {
    // ---- Todas as leituras primeiro
    const counterRef = fs.doc('counters/orders');
    const ids = [...new Set(lines.map((l) => l.productId))];
    const productRefs = ids.map((id) => fs.doc(`products/${id}`));
    const [counterSnap, ...productSnaps] = await tx.getAll(counterRef, ...productRefs);
    const couponRef = couponCode ? fs.doc(`coupons/${couponCode}`) : null;
    const couponSnap = couponRef ? await tx.get(couponRef) : null;
    const customerRef = phone ? fs.doc(`customers/${phone}`) : null;
    const customerSnap = customerRef ? await tx.get(customerRef) : null;

    const products = new Map<string, Product>();
    for (const s of productSnaps) if (s.exists) products.set(s.id, { id: s.id, ...(s.data() as Omit<Product, 'id'>) });
    const coupon = couponSnap?.exists ? ({ id: couponSnap.id, ...(couponSnap.data() as Omit<Coupon, 'id'>) }) : null;
    if (couponCode && !coupon) throw new HttpError(400, 'cupom', 'Cupom não encontrado.', { fields: { couponCode: 'Cupom não encontrado.' } });

    const calc = calculateOrder(lines, products, { shippingKind, coupon, now });
    if (calc.errors.length) throw new StockError(calc.errors);
    if (calc.couponError) throw new HttpError(400, 'cupom', calc.couponError, { fields: { couponCode: calc.couponError } });

    const movement = applyStockMovement(calc.items, products, -1);
    if (movement.problems.length) throw new StockError(movement.problems);

    // ---- Escritas
    for (const c of movement.changes) {
      tx.update(fs.doc(`products/${c.productId}`), { variants: c.variants, stock: c.stock, updatedAt: now });
    }
    const number = ((counterSnap.data()?.value as number) ?? 0) + 1;
    tx.set(counterRef, { value: number }, { merge: true });
    if (coupon && couponRef) tx.update(couponRef, { uses: (coupon.uses ?? 0) + 1 });

    const by = manual && staff ? staff.uid : 'site';
    const order: Omit<Order, 'id'> = {
      number,
      source: manual ? 'manual' : 'site',
      items: calc.items,
      subtotal: calc.subtotal,
      discount: calc.discount,
      couponCode: coupon ? coupon.code : null,
      shipping: calc.shipping,
      shippingKind,
      total: calc.total,
      customer,
      fulfillment: input.fulfillment,
      address,
      paymentMethod: input.paymentMethod,
      paymentStatus: manual && input.paid ? 'pago' : 'pendente',
      status: manual ? 'confirmado' : 'novo',
      history: [
        {
          at: now,
          by,
          byName: manual && staff ? staff.name : 'Site',
          action: 'criado',
          note: manual ? 'Venda manual registrada no painel' : 'Pedido recebido pelo site',
        },
      ],
      notes: cleanText(input.notes, 500),
      internalNotes: '',
      stockDeducted: true,
      reviewToken,
      reviewSubmitted: false,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
      createdBy: by,
    };
    tx.set(orderRef, order);

    if (customerRef && customerSnap) {
      const prev = customerSnap.data() as Customer | undefined;
      const emails = new Set(prev?.emails ?? []);
      if (customer.email) emails.add(customer.email);
      const addresses = [...(prev?.addresses ?? [])];
      const addrKey = (a: { neighborhood: string; city: string; street?: string | null }) => `${a.street ?? ''}|${a.neighborhood}|${a.city}`.toLowerCase();
      if ((address.neighborhood || address.city) && !addresses.some((a) => addrKey(a) === addrKey(address))) {
        addresses.unshift(address);
      }
      tx.set(customerRef, {
        name: customer.name || prev?.name || '',
        phone,
        type: customer.type,
        company: customer.company ?? prev?.company ?? null,
        emails: [...emails].slice(0, 5),
        addresses: addresses.slice(0, 5),
        internalNotes: prev?.internalNotes ?? '',
        ordersCount: (prev?.ordersCount ?? 0) + 1,
        totalSpent: (prev?.totalSpent ?? 0) + calc.total,
        lastOrderAt: now,
        lastOrderId: orderRef.id,
        createdAt: prev?.createdAt ?? now,
        updatedAt: now,
      });
    }
    return { number, calc };
  });

  const message = buildOrderMessage({
    number: result.number,
    items: result.calc.items,
    subtotal: result.calc.subtotal,
    discount: result.calc.discount,
    total: result.calc.total,
    fulfillment: input.fulfillment,
    shippingKind,
    name: customer.name,
    neighborhood: address.neighborhood,
    city: address.city,
    paymentMethod: input.paymentMethod,
    notes: cleanText(input.notes, 500),
  });

  let pix: CreateOrderResult['pix'] = null;
  if (input.paymentMethod === 'pix' && isPixConfigured(settings.pixKey, settings.pixReceiverName, settings.pixReceiverCity)) {
    const payload = buildPixPayload({
      key: settings.pixKey,
      receiverName: settings.pixReceiverName,
      receiverCity: settings.pixReceiverCity,
      amountCents: result.calc.total,
      txid: `PED${String(result.number).padStart(4, '0')}`,
    });
    const qr = await QRCode.toDataURL(payload, { margin: 1, width: 440, errorCorrectionLevel: 'M' });
    pix = { payload, qr };
  }

  return {
    orderId: orderRef.id,
    number: result.number,
    numberLabel: formatOrderNumber(result.number),
    subtotal: result.calc.subtotal,
    discount: result.calc.discount,
    total: result.calc.total,
    shippingKind,
    items: result.calc.items,
    whatsappUrl: whatsappLink(settings.whatsapp, message),
    pix,
  };
}

export async function handleCreateOrder(request: Request, fallbackIp?: string): Promise<Response> {
  try {
    const body = await readJson(request);
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      throw new HttpError(400, 'validacao', 'Confira os campos destacados.', { fields: zodFields(parsed.error) });
    }
    const input = parsed.data;
    // Honeypot preenchido = robô. Responde genérico sem criar nada.
    if (input.website && input.website.trim() !== '') {
      throw new HttpError(400, 'validacao', 'Não foi possível enviar o pedido.');
    }
    const staff = input.source === 'manual' ? await getStaff(request) : null;
    if (input.source === 'manual' && !staff) throw new HttpError(401, 'nao_autenticado', 'Entre no painel para registrar a venda.');

    if (!staff) {
      const ip = clientIp(request, fallbackIp);
      await checkRateLimit(`order:ip:${ip}`, 10, 10 * 60 * 1000);
      const phone = normalizePhone(input.customer.phone);
      if (phone) await checkRateLimit(`order:phone:${phone}`, 5, 10 * 60 * 1000);
    }
    const result = await createOrder(input, staff);
    return json({ ok: true, ...result }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
