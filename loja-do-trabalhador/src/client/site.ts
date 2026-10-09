// Script comum do site público: menu, carrinho (gaveta), botões "Adicionar", toasts e analytics.
import { cart, keyOf, refreshCart, fmt, clampQty, type StoredLine } from './cart-store';
import { el, svgIcon, toast, trapFocus, track, initAnalytics } from './ui';

initAnalytics();

// ---------- Menu mobile ----------
const menuBtn = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
menuBtn?.addEventListener('click', () => {
  const open = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', String(!open));
  menuBtn.setAttribute('aria-label', open ? 'Abrir menu' : 'Fechar menu');
  if (mobileNav) mobileNav.hidden = open;
});

// ---------- Contador ----------
function renderCount() {
  const n = cart.count();
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((c) => {
    c.textContent = n > 99 ? '99+' : String(n);
    c.dataset.count = String(n);
  });
  document.getElementById('cart-open')?.setAttribute('aria-label', n ? `Abrir carrinho (${n} ${n === 1 ? 'item' : 'itens'})` : 'Abrir carrinho');
}

// ---------- Gaveta ----------
const drawer = document.getElementById('cart-drawer');
const backdrop = document.querySelector<HTMLElement>('.drawer-backdrop');
const linesBox = document.getElementById('cart-lines');
const foot = document.getElementById('cart-foot');
let release: (() => void) | null = null;
let lastFocus: HTMLElement | null = null;

function qtyControl(line: StoredLine, onChange: (q: number) => void): HTMLElement {
  const input = el('input', { type: 'number', min: 1, max: 99, inputmode: 'numeric', value: line.quantity, 'aria-label': `Quantidade de ${line.name}` }) as HTMLInputElement;
  input.addEventListener('change', () => onChange(clampQty(Number(input.value))));
  const minus = el('button', { type: 'button', 'aria-label': `Diminuir quantidade de ${line.name}` }, svgIcon('minus'));
  const plus = el('button', { type: 'button', 'aria-label': `Aumentar quantidade de ${line.name}` }, svgIcon('plus'));
  minus.addEventListener('click', () => onChange(clampQty(line.quantity - 1)));
  plus.addEventListener('click', () => onChange(clampQty(line.quantity + 1)));
  if (line.quantity <= 1) minus.setAttribute('disabled', '');
  if (line.quantity >= 99) plus.setAttribute('disabled', '');
  return el('div', { class: 'qty' }, minus, input, plus);
}

export function renderLine(line: StoredLine): HTMLElement {
  const key = keyOf(line);
  const remove = el('button', { type: 'button', class: 'btn btn-ghost btn-sm', 'aria-label': `Remover ${line.name}` }, svgIcon('trash'), 'Remover');
  remove.addEventListener('click', () => {
    cart.remove(key);
    toast(`${line.name} removido do carrinho.`);
  });
  return el(
    'div',
    { class: 'cart-line', 'data-line': key },
    el('img', { src: line.image, alt: '', width: 64, height: 64, loading: 'lazy' }),
    el(
      'div',
      {},
      el('a', { class: 'cart-line-name', href: `/produto/${line.slug}`, text: line.name }),
      line.variantLabel ? el('div', { class: 'hint', text: line.variantLabel }) : null,
      el(
        'div',
        { class: 'cart-line-meta' },
        qtyControl(line, (q) => cart.setQty(key, q)),
        el('strong', { text: fmt(line.price * line.quantity) }),
      ),
      line.info ? el('div', { class: 'cart-info', text: line.info }) : null,
      line.warning ? el('div', { class: 'cart-warn', role: 'alert', text: line.warning }) : null,
      remove,
    ),
  );
}

function renderDrawer() {
  if (!linesBox || !foot) return;
  linesBox.replaceChildren();
  if (!cart.lines.length) {
    linesBox.append(
      el('div', { class: 'empty' }, el('p', { text: 'Seu carrinho está vazio.' }), el('a', { class: 'btn btn-primary', href: '/loja', text: 'Ver produtos' })),
    );
    foot.hidden = true;
    return;
  }
  foot.hidden = false;
  for (const l of cart.lines) linesBox.append(renderLine(l));
  const sub = document.getElementById('cart-subtotal');
  if (sub) sub.textContent = fmt(cart.subtotal());
  const blocked = cart.lines.some((l) => l.warning);
  const checkout = document.getElementById('cart-checkout');
  checkout?.setAttribute('aria-disabled', blocked ? 'true' : 'false');
}

export function openCart() {
  if (!drawer) return;
  lastFocus = document.activeElement as HTMLElement;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop?.classList.add('show');
  document.body.style.overflow = 'hidden';
  renderDrawer();
  release = trapFocus(drawer, closeCart);
  drawer.querySelector<HTMLElement>('[data-cart-close]')?.focus();
  refreshCart().catch(() => {});
}

export function closeCart() {
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop?.classList.remove('show');
  document.body.style.overflow = '';
  release?.();
  release = null;
  lastFocus?.focus();
}

document.getElementById('cart-open')?.addEventListener('click', openCart);
document.querySelectorAll('[data-cart-close]').forEach((b) => b.addEventListener('click', closeCart));
document.getElementById('cart-checkout')?.addEventListener('click', (e) => {
  if ((e.currentTarget as HTMLElement).getAttribute('aria-disabled') === 'true') {
    e.preventDefault();
    toast('Ajuste os itens marcados antes de finalizar.', 'error');
  } else {
    track('begin_checkout', { value: cart.subtotal() / 100, currency: 'BRL' });
  }
});

cart.subscribe(() => {
  renderCount();
  if (drawer?.classList.contains('open')) renderDrawer();
});
renderCount();

// ---------- Botões "Adicionar" (cards) ----------
export function bump() {
  const btn = document.getElementById('cart-open');
  btn?.classList.remove('bump');
  void btn?.offsetWidth;
  btn?.classList.add('bump');
}

document.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-add]');
  if (!btn) return;
  e.preventDefault();
  const d = btn.dataset;
  cart.add({
    productId: d.id!,
    variantId: null,
    name: d.name!,
    variantLabel: null,
    price: Number(d.price),
    image: d.image!,
    slug: d.slug!,
    unit: d.unit,
    quantity: 1,
  });
  bump();
  toast(`${d.name} adicionado ao carrinho.`);
  track('add_to_cart', { currency: 'BRL', value: Number(d.price) / 100, items: [{ item_id: d.id, item_name: d.name, price: Number(d.price) / 100, quantity: 1 }] });
});

// ---------- Cliques no WhatsApp ----------
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href*="wa.me"]');
  if (a) track('whatsapp_click', { location: a.dataset.whats || 'link' });
});

// Abrir o carrinho via #carrinho
if (location.hash === '#carrinho') openCart();
