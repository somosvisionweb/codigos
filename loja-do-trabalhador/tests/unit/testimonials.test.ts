import { describe, expect, it } from 'vitest';
import { publicTestimonials, demoAllowed, ratingSummary, shouldShowTestimonialsSection, shouldEmitAggregateRating } from '../../src/lib/testimonials';
import type { Testimonial } from '../../src/lib/types';

const t = (over: Partial<Testimonial>): Testimonial => ({
  id: Math.random().toString(36), name: 'X', displayName: 'X', text: 't', rating: 5, source: 'whatsapp',
  consent: true, status: 'aprovado', featured: false, order: 0, demo: false, createdAt: 1, updatedAt: 1, ...over,
});

describe('depoimentos públicos', () => {
  const list = [t({ id: 'ok' }), t({ id: 'demo', demo: true }), t({ id: 'pend', status: 'pendente' }), t({ id: 'semok', consent: false }), t({ id: 'oc', status: 'oculto' })];

  it('produção nunca exibe demo: true', () => {
    const allow = demoAllowed({ NODE_ENV: 'production', SHOW_DEMO_TESTIMONIALS: 'true' }); // sem emulador
    expect(allow).toBe(false);
    expect(publicTestimonials(list, { allowDemo: allow }).map((x) => x.id)).toEqual(['ok']);
  });
  it('demo só com flag + emulador', () => {
    expect(demoAllowed({ SHOW_DEMO_TESTIMONIALS: 'true', FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' })).toBe(true);
    expect(demoAllowed({ FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080' })).toBe(false);
  });
  it('seção e JSON-LD respeitam mínimos', () => {
    expect(shouldShowTestimonialsSection([t({}), t({})])).toBe(false);
    expect(shouldShowTestimonialsSection([t({}), t({}), t({})])).toBe(true);
    const four = [t({}), t({}), t({}), t({}), t({ rating: null })];
    expect(shouldEmitAggregateRating(four)).toBe(false);
    expect(shouldEmitAggregateRating([...four, t({ rating: 4 })])).toBe(true);
    expect(ratingSummary([t({ rating: 5 }), t({ rating: 4 })]).average).toBe(4.5);
  });
});
