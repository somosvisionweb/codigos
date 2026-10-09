// Funções comuns ao site e ao painel.

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const reais = (centavos) => brl.format((centavos || 0) / 100).replace(/ /g, ' ');

/** "24,90" | "24.90" | 24.9 → 2490 */
export function paraCentavos(v) {
  if (typeof v === 'number') return Math.round(v * 100);
  const s = String(v || '').trim().replace(/[^\d,.-]/g, '');
  const num = Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s);
  return Number.isFinite(num) ? Math.round(num * 100) : NaN;
}
export const centavosTexto = (c) => (c == null ? '' : (c / 100).toFixed(2).replace('.', ','));

export const semAcento = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Telefone → só dígitos com 55 (ou '' se inválido). */
export function telefone(v) {
  let d = String(v || '').replace(/\D/g, '').replace(/^0+/, '');
  if (d.length === 10 || d.length === 11) d = '55' + d;
  return /^55\d{10,11}$/.test(d) ? d : '';
}

export const linkWhats = (numero, texto) => {
  const d = String(numero || '').replace(/\D/g, '');
  return `https://wa.me/${d}?text=${encodeURIComponent(texto)}`;
};

export const precoAtual = (p) => (p.precoPromo && p.precoPromo < p.preco ? p.precoPromo : p.preco);

export function freteGratis(areas, bairro, cidade) {
  const lista = (areas || []).map(semAcento).filter(Boolean);
  const b = semAcento(bairro);
  const c = semAcento(cidade);
  return lista.some((a) => (b && a === b) || (c && a === c));
}

/** Cria elemento sem innerHTML (texto sempre escapado). */
export function el(tag, attrs = {}, ...filhos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos.flat()) if (f != null && f !== false) n.append(f instanceof Node ? f : String(f));
  return n;
}

export const configurado = (cfg) => Boolean(cfg && cfg.apiKey && cfg.projectId);
