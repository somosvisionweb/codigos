// npm run gen:images — gera placeholders WebP dos produtos, ícones e a imagem Open Graph.
// Os placeholders ficam em public/images/produtos/<slug>.webp até o dono enviar fotos reais pelo painel.
import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import sharp from 'sharp';
import { products, categories } from './catalog-data';

const BLUE = '#1C6FB5';
const DARK = '#0B2E4F';
const BG = '#F5F8FB';

function iconInner(name: string): string {
  const svg = readFileSync(`node_modules/lucide-static/icons/${name}.svg`, 'utf8');
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function wrap(text: string, max = 22): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  return lines.slice(0, 3);
}

async function productPlaceholder(name: string, icon: string, out: string) {
  const lines = wrap(name);
  const text = lines
    .map((l, i) => `<text x="400" y="${590 + i * 52}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="44" fill="${DARK}">${esc(l)}</text>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <rect width="800" height="800" fill="#FFFFFF"/>
  <rect x="24" y="24" width="752" height="752" rx="32" fill="${BG}"/>
  <circle cx="400" cy="320" r="170" fill="#E3EEF8"/>
  <g transform="translate(272 192) scale(10.6667)" fill="none" stroke="${BLUE}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${iconInner(icon)}</g>
  ${text}
  <text x="400" y="750" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" fill="#5B6B7C">Foto ilustrativa — imagem real em breve</text>
</svg>`;
  await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(out);
}

async function ogImage(out: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${DARK}"/>
  <rect x="0" y="560" width="1200" height="70" fill="${BLUE}"/>
  <text x="80" y="250" font-family="Inter, sans-serif" font-weight="800" font-size="96" fill="#FFFFFF" letter-spacing="2">LOJA <tspan font-weight="400" font-size="64">do</tspan></text>
  <text x="80" y="350" font-family="Inter, sans-serif" font-weight="800" font-size="96" fill="#FFFFFF" letter-spacing="2">TRABALHADOR</text>
  <text x="80" y="440" font-family="Inter, sans-serif" font-size="44" fill="#BFD8EE">Entender para melhor atender.</text>
  <text x="80" y="605" font-family="Inter, sans-serif" font-size="28" fill="#FFFFFF">Limpeza · EPIs · Calçados de segurança · Ferramentas · Automotivo</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(out);
}

async function favicon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${BLUE}"/><text x="32" y="43" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="28" fill="#fff">LT</text></svg>`;
  await sharp(Buffer.from(svg)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
  await sharp(Buffer.from(svg)).resize(32, 32).png().toFile('public/favicon-32.png');
}

async function main() {
  mkdirSync('public/images/produtos', { recursive: true });
  const icons = Object.fromEntries(categories.map((c) => [c.slug, c.icon]));
  for (const p of products) {
    await productPlaceholder(p.name, icons[p.category] ?? 'package', `public/images/produtos/${p.slug}.webp`);
  }
  // Placeholder genérico para produtos novos sem foto.
  await productPlaceholder('Loja do Trabalhador', 'package', 'public/images/produtos/sem-foto.webp');
  await ogImage('public/images/og-image.png');
  if (!existsSync('public/favicon.svg') || process.argv.includes('--force')) await favicon();
  console.log(`✔ ${products.length + 1} placeholders, imagem Open Graph e ícones gerados.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
