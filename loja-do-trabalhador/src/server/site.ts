// Utilidades de renderização das páginas públicas.
import { filled } from '../content/defaults';
import type { SiteSettings } from '../lib/types';

export function siteUrl(): string {
  return (process.env.SITE_URL || process.env.URL || 'http://localhost:4321').replace(/\/$/, '');
}

export function absolute(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return siteUrl() + (path.startsWith('/') ? path : '/' + path);
}

export function whatsappNumber(s: SiteSettings): string {
  return filled(s.whatsapp) ? s.whatsapp.replace(/\D/g, '') : '';
}

export function instagramUrl(s: SiteSettings): string {
  return filled(s.instagram) ? `https://instagram.com/${s.instagram.replace(/^@/, '')}` : '';
}

/** JSON-LD seguro para <script type="application/ld+json"> (escapa "<"). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
