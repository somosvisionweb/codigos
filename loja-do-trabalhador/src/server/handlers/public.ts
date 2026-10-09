// Rotas públicas: avaliação de compra verificada, orçamento B2B e consulta de preços do carrinho.
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { db } from '../firebase';
import { HttpError, json, errorResponse, readJson, zodFields, clientIp } from '../http';
import { checkRateLimit } from '../ratelimit';
import { getSettings, getProductsByIds } from '../repo';
import { normalizePhone } from '../../lib/phone';
import { cleanText, shortName } from '../../lib/text';
import { MAX_TESTIMONIAL_LENGTH } from '../../lib/testimonials';
import { whatsappLink } from '../../lib/whatsapp';
import { availabilityOf, coverImage, effectivePrice, stockOf } from '../../lib/catalog';
import type { Order } from '../../lib/types';

function sameToken(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// ---------- submit-review ----------
export const reviewSchema = z.object({
  orderId: z.string().min(1).max(64),
  token: z.string().min(10).max(100),
  name: z.string().trim().min(2, 'Informe seu nome.').max(80),
  role: z.string().trim().max(80).optional().default(''),
  text: z.string().trim().min(10, 'Escreva pelo menos uma frase.').max(MAX_TESTIMONIAL_LENGTH, `Máximo de ${MAX_TESTIMONIAL_LENGTH} caracteres.`),
  rating: z.number().int().min(1, 'Escolha uma nota.').max(5),
  consent: z.boolean().default(false),
  website: z.string().max(200).optional(),
});

export async function submitReview(input: z.infer<typeof reviewSchema>, now = Date.now()) {
  const fs = db();
  const orderRef = fs.doc(`orders/${input.orderId}`);
  const testimonialRef = fs.doc(`testimonials/order-${input.orderId}`);
  await fs.runTransaction(async (tx) => {
    const snap = await tx.get(orderRef);
    const order = snap.data() as Order | undefined;
    if (!snap.exists || !order || !order.reviewToken || !sameToken(order.reviewToken, input.token)) {
      throw new HttpError(403, 'link_invalido', 'Este link de avaliação não é válido.');
    }
    if (order.deletedAt || order.status === 'cancelado') {
      throw new HttpError(403, 'link_invalido', 'Este pedido não pode ser avaliado.');
    }
    const existing = await tx.get(testimonialRef);
    if (order.reviewSubmitted || existing.exists) {
      throw new HttpError(409, 'ja_avaliado', 'Este pedido já foi avaliado. Obrigado!');
    }
    const name = cleanText(input.name, 80);
    tx.create(testimonialRef, {
      name,
      displayName: shortName(name),
      role: cleanText(input.role, 80) || null,
      text: cleanText(input.text, MAX_TESTIMONIAL_LENGTH),
      rating: input.rating,
      source: 'compra_verificada',
      orderId: input.orderId,
      productId: order.items?.length === 1 ? order.items[0].productId : null,
      imageUrl: null,
      consent: input.consent === true,
      status: 'pendente',
      featured: false,
      order: 0,
      demo: false,
      createdAt: now,
      updatedAt: now,
    });
    tx.update(orderRef, { reviewSubmitted: true, updatedAt: now });
  });
  return { ok: true };
}

export async function handleSubmitReview(request: Request, fallbackIp?: string) {
  try {
    const parsed = reviewSchema.safeParse(await readJson(request, 10_000));
    if (!parsed.success) throw new HttpError(400, 'validacao', 'Confira os campos destacados.', { fields: zodFields(parsed.error) });
    if (parsed.data.website) throw new HttpError(400, 'validacao', 'Não foi possível enviar.');
    await checkRateLimit(`review:ip:${clientIp(request, fallbackIp)}`, 10, 10 * 60 * 1000);
    return json(await submitReview(parsed.data), 201);
  } catch (e) {
    return errorResponse(e);
  }
}

// ---------- submit-lead ----------
export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(80),
  company: z.string().trim().min(2, 'Informe a empresa ou condomínio.').max(100),
  segment: z.string().trim().max(60).optional().default(''),
  items: z.string().trim().min(3, 'Conte o que você precisa.').max(1500),
  phone: z.string().trim().max(30),
  email: z.union([z.literal(''), z.email('E-mail inválido.').max(120)]).optional().default(''),
  city: z.string().trim().max(80).optional().default(''),
  acceptPrivacy: z.literal(true, { message: 'É preciso aceitar a política de privacidade.' }),
  website: z.string().max(200).optional(),
});

export async function submitLead(input: z.infer<typeof leadSchema>, now = Date.now()) {
  const phone = normalizePhone(input.phone);
  if (!phone) throw new HttpError(400, 'validacao', 'Confira os campos destacados.', { fields: { phone: 'Informe um telefone com DDD.' } });
  const lead = {
    name: cleanText(input.name, 80),
    company: cleanText(input.company, 100),
    segment: cleanText(input.segment, 60),
    items: cleanText(input.items, 1500),
    phone,
    email: input.email ? cleanText(input.email, 120).toLowerCase() : null,
    city: cleanText(input.city, 80) || null,
    status: 'novo',
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
  const ref = await db().collection('leads').add(lead);
  const settings = await getSettings();
  const msg = [
    'Olá, Loja do Trabalhador! Acabei de pedir um orçamento pelo site:',
    '',
    `*Nome:* ${lead.name}`,
    `*Empresa/Condomínio:* ${lead.company}`,
    lead.segment ? `*Segmento:* ${lead.segment}` : '',
    lead.city ? `*Cidade:* ${lead.city}` : '',
    '',
    '*O que preciso:*',
    lead.items,
    '',
    'Aguardo o retorno, obrigado!',
  ]
    .filter((l, i, arr) => l !== '' || arr[i - 1] !== '')
    .join('\n');
  return { ok: true, leadId: ref.id, whatsappUrl: whatsappLink(settings.whatsapp, msg) };
}

export async function handleSubmitLead(request: Request, fallbackIp?: string) {
  try {
    const parsed = leadSchema.safeParse(await readJson(request, 10_000));
    if (!parsed.success) throw new HttpError(400, 'validacao', 'Confira os campos destacados.', { fields: zodFields(parsed.error) });
    if (parsed.data.website) throw new HttpError(400, 'validacao', 'Não foi possível enviar.');
    await checkRateLimit(`lead:ip:${clientIp(request, fallbackIp)}`, 5, 10 * 60 * 1000);
    return json(await submitLead(parsed.data), 201);
  } catch (e) {
    return errorResponse(e);
  }
}

// ---------- catalog (preços e disponibilidade atuais para o carrinho) ----------
export async function handleCatalog(request: Request) {
  try {
    const url = new URL(request.url);
    const ids = (url.searchParams.get('ids') || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 60);
    const [settings, products] = await Promise.all([getSettings(), getProductsByIds(ids)]);
    const threshold = settings.lowStockThreshold ?? 5;
    const out: Record<string, unknown> = {};
    for (const id of ids) {
      const p = products.get(id);
      if (!p || !p.active) {
        out[id] = { active: false };
        continue;
      }
      const total = stockOf(p);
      out[id] = {
        active: true,
        name: p.name,
        slug: p.slug,
        unit: p.unit,
        price: effectivePrice(p),
        listPrice: p.price,
        image: coverImage(p, true),
        variantLabel: p.variantLabel || 'Opção',
        availability: availabilityOf(total, threshold),
        // Quantidade exata só é exposta quando já está abaixo do limite de "últimas unidades".
        left: total > 0 && total <= threshold ? total : null,
        variants: (p.variants ?? []).map((v) => ({
          id: v.id,
          label: v.label,
          availability: availabilityOf(v.stock, threshold),
          left: v.stock > 0 && v.stock <= threshold ? v.stock : null,
        })),
      };
    }
    return json({ ok: true, maintenance: settings.maintenanceMode, products: out });
  } catch (e) {
    return errorResponse(e);
  }
}
