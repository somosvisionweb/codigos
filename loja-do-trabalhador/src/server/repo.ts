// Leituras do site público (servidor). Nunca expõe estoque exato nem dados privados.
import { db } from './firebase';
import { defaultSettings } from '../content/defaults';
import { publicTestimonials, demoAllowed } from '../lib/testimonials';
import type { Banner, Category, Product, SiteSettings, Testimonial } from '../lib/types';

function withId<T>(snap: FirebaseFirestore.DocumentSnapshot): T {
  return { id: snap.id, ...(snap.data() as object) } as T;
}

export async function getSettings(): Promise<SiteSettings> {
  const snap = await db().doc('settings/site').get();
  return { ...defaultSettings, ...((snap.data() as Partial<SiteSettings>) ?? {}) };
}

export async function getCategories(): Promise<Category[]> {
  const snap = await db().collection('categories').where('active', '==', true).get();
  return snap.docs.map((d) => withId<Category>(d)).sort((a, b) => a.order - b.order);
}

export async function getProducts(): Promise<Product[]> {
  const snap = await db().collection('products').where('active', '==', true).get();
  return snap.docs.map((d) => withId<Product>(d)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const snap = await db().collection('products').where('slug', '==', slug).limit(1).get();
  const doc = snap.docs[0];
  if (!doc) return null;
  const p = withId<Product>(doc);
  return p.active ? p : null;
}

export async function getProductsByIds(ids: string[]): Promise<Map<string, Product>> {
  const unique = [...new Set(ids)].filter(Boolean).slice(0, 100);
  const map = new Map<string, Product>();
  if (!unique.length) return map;
  const refs = unique.map((id) => db().doc(`products/${id}`));
  const snaps = await db().getAll(...refs);
  for (const s of snaps) if (s.exists) map.set(s.id, withId<Product>(s));
  return map;
}

export async function getPublicTestimonials(): Promise<Testimonial[]> {
  const snap = await db().collection('testimonials').where('status', '==', 'aprovado').get();
  const list = snap.docs.map((d) => withId<Testimonial>(d));
  return publicTestimonials(list, { allowDemo: demoAllowed(process.env) });
}

export async function getActiveBanners(now = Date.now()): Promise<Banner[]> {
  const snap = await db().collection('banners').where('active', '==', true).get();
  return snap.docs
    .map((d) => withId<Banner>(d))
    .filter((b) => (!b.startsAt || b.startsAt <= now) && (!b.endsAt || b.endsAt >= now))
    .sort((a, b) => a.order - b.order);
}

/** Relacionados: definidos no admin; por padrão, mesma categoria. */
export function relatedProducts(product: Product, all: Product[], max = 4): Product[] {
  const byId = new Map(all.map((p) => [p.id, p]));
  const chosen = (product.relatedIds ?? []).map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
  if (chosen.length) return chosen.slice(0, max);
  return all.filter((p) => p.id !== product.id && p.categoryId === product.categoryId).slice(0, max);
}
