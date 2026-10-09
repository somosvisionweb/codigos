import type { Testimonial } from './types';

export const MIN_TO_SHOW_SECTION = 3;
export const MIN_FOR_STRUCTURED_DATA = 5;
export const MAX_TESTIMONIAL_LENGTH = 600;

/**
 * Filtra depoimentos que podem aparecer no site público.
 * Regras: aprovado, com autorização de publicação e — fora do ambiente de demonstração — nunca `demo: true`.
 */
export function publicTestimonials(list: Testimonial[], opts: { allowDemo: boolean }): Testimonial[] {
  return list
    .filter((t) => t.status === 'aprovado' && t.consent === true)
    .filter((t) => opts.allowDemo || t.demo !== true)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || (a.order ?? 0) - (b.order ?? 0) || b.createdAt - a.createdAt);
}

/**
 * Só permite depoimentos de demonstração quando explicitamente pedido E rodando contra o emulador.
 * Em produção (sem FIRESTORE_EMULATOR_HOST) é sempre falso.
 */
export function demoAllowed(env: Record<string, string | undefined>): boolean {
  return env.SHOW_DEMO_TESTIMONIALS === 'true' && Boolean(env.FIRESTORE_EMULATOR_HOST);
}

export interface RatingSummary {
  count: number; // depoimentos exibidos
  rated: number; // com nota
  average: number | null; // 1 casa decimal
}

export function ratingSummary(list: Testimonial[]): RatingSummary {
  const rated = list.filter((t) => typeof t.rating === 'number' && t.rating >= 1 && t.rating <= 5);
  const avg = rated.length ? rated.reduce((s, t) => s + (t.rating as number), 0) / rated.length : null;
  return { count: list.length, rated: rated.length, average: avg == null ? null : Math.round(avg * 10) / 10 };
}

export function shouldShowTestimonialsSection(list: Testimonial[]): boolean {
  return list.length >= MIN_TO_SHOW_SECTION;
}

export function shouldEmitAggregateRating(list: Testimonial[]): boolean {
  return ratingSummary(list).rated >= MIN_FOR_STRUCTURED_DATA;
}

export const sourceLabel: Record<Testimonial['source'], string> = {
  compra_verificada: 'Compra verificada',
  whatsapp: 'Via WhatsApp',
  instagram: 'Via Instagram',
  google: 'Via Google',
  presencial: 'Na loja',
};
