import { cart, refreshCart, fmt, keyOf, saveLastOrder, readLastOrder, type StoredLine } from './cart-store';
import { renderLine } from './site';
import { toast, track } from './ui';
import { isFreeShippingArea } from '../lib/shipping';
import { normalizePhone } from '../lib/phone';
import { buildOrderMessage, whatsappLink } from '../lib/whatsapp';
import type { PaymentMethod, ShippingKind } from '../lib/types';

const root = document.getElementById('checkout-root')!;
const cfg = JSON.parse(root.dataset.config || '{}') as { areas: string[]; whatsapp: string; maintenance: boolean; pix: boolean };
const form = document.getElementById('checkout-form') as HTMLFormElement;
const main = document.getElementById('checkout-main')!;
const empty = document.getElementById('checkout-empty')!;
const summary = document.getElementById('summary-lines')!;
const formError = document.getElementById('form-error')!;
const submit = document.getElementById('submit-order') as HTMLButtonElement;
const planB = document.getElementById('plan-b')!;
let done = false;

const val = (name: string) => ((form.elements.namedItem(name) as HTMLInputElement | null)?.value ?? '').trim();
const radio = (name: string) => (form.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null)?.value ?? '';

function shippingKind(): ShippingKind {
  if (radio('fulfillment') === 'retirada') return 'retirada';
  return isFreeShippingArea(cfg.areas, val('neighborhood'), val('city')) ? 'gratis' : 'a_combinar';
}

function renderShipping() {
  const box = document.getElementById('shipping-info')!;
  const sum = document.getElementById('summary-shipping')!;
  const kind = shippingKind();
  const delivery = radio('fulfillment') === 'entrega';
  (document.getElementById('address-fields') as HTMLElement).hidden = !delivery;
  if (kind === 'retirada') {
    box.className = 'alert alert-info';
    box.textContent = 'Retirada na loja: avisamos pelo WhatsApp quando estiver pronto.';
    sum.textContent = 'Retirada na loja.';
  } else if (!val('neighborhood') && !val('city')) {
    box.className = 'alert alert-info';
    box.textContent = 'Informe bairro e cidade para ver o frete.';
    sum.textContent = 'Frete: informe o bairro.';
  } else if (kind === 'gratis') {
    box.className = 'alert alert-ok';
    box.textContent = 'Frete grátis para o seu endereço!';
    sum.textContent = 'Frete grátis.';
  } else {
    box.className = 'alert alert-warn';
    box.textContent = 'Frete a combinar no WhatsApp (fora da área de frete grátis).';
    sum.textContent = 'Frete a combinar no WhatsApp.';
  }
}

function render() {
  if (done) return;
  const has = cart.lines.length > 0;
  main.hidden = !has;
  empty.hidden = has;
  if (!has) {
    const last = readLastOrder();
    const btn = document.getElementById('repeat-last') as HTMLButtonElement;
    btn.hidden = !last;
    return;
  }
  summary.replaceChildren(...cart.lines.map((l) => renderLine(l)));
  document.getElementById('summary-subtotal')!.textContent = fmt(cart.subtotal());
}

document.getElementById('repeat-last')?.addEventListener('click', () => {
  const last = readLastOrder();
  if (!last) return;
  for (const l of last.items) cart.add({ ...l, warning: null, info: null });
  toast('Itens do último pedido adicionados. Conferindo preços atuais...');
  refreshCart().catch(() => {});
});

form.addEventListener('input', renderShipping);
form.addEventListener('change', () => {
  (document.getElementById('company-field') as HTMLElement).hidden = radio('type') !== 'PJ';
  renderShipping();
});

function clearErrors() {
  formError.hidden = true;
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((e) => (e.hidden = true));
  form.querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
}

const fieldInput: Record<string, string> = {
  'customer.name': 'f-name', 'customer.phone': 'f-phone', 'customer.company': 'f-company', 'address.neighborhood': 'f-neigh',
  'address.city': 'f-city', 'address.street': 'f-street', acceptPrivacy: 'f-privacy', couponCode: 'f-coupon',
};

function showErrors(fields: Record<string, string>, message = 'Confira os campos destacados.') {
  let first: HTMLElement | null = null;
  for (const [k, msg] of Object.entries(fields)) {
    const box = form.querySelector<HTMLElement>(`[data-error-for="${k}"]`);
    const input = fieldInput[k] ? document.getElementById(fieldInput[k]) : null;
    if (box) {
      box.textContent = msg;
      box.hidden = false;
      if (input) {
        box.id = `err-${fieldInput[k]}`;
        input.setAttribute('aria-describedby', box.id);
      }
    }
    if (input) {
      input.setAttribute('aria-invalid', 'true');
      first ??= input;
    }
  }
  formError.textContent = message;
  formError.hidden = false;
  (first ?? formError).focus();
}

function validate(): Record<string, string> {
  const f: Record<string, string> = {};
  if (val('name').length < 2) f['customer.name'] = 'Informe seu nome.';
  if (!normalizePhone(val('phone'))) f['customer.phone'] = 'Informe um telefone com DDD.';
  if (radio('type') === 'PJ' && !val('company')) f['customer.company'] = 'Informe o nome da empresa.';
  if (!val('neighborhood')) f['address.neighborhood'] = 'Informe o bairro.';
  if (!val('city')) f['address.city'] = 'Informe a cidade.';
  if (radio('fulfillment') === 'entrega' && !val('street')) f['address.street'] = 'Informe rua e número.';
  if (!(document.getElementById('f-privacy') as HTMLInputElement).checked) f.acceptPrivacy = 'É preciso aceitar a política de privacidade.';
  return f;
}

function planBMessage(): string {
  return buildOrderMessage({
    number: null,
    items: cart.lines.map((l) => ({ name: l.name, variantLabel: l.variantLabel, quantity: l.quantity, lineTotal: l.price * l.quantity })),
    subtotal: cart.subtotal(),
    fulfillment: radio('fulfillment') as 'entrega' | 'retirada',
    shippingKind: shippingKind(),
    name: val('name'),
    neighborhood: val('neighborhood'),
    city: val('city'),
    paymentMethod: (radio('paymentMethod') || 'pix') as PaymentMethod,
    notes: val('notes'),
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();
  planB.hidden = true;
  if (cfg.maintenance) return;
  const errors = validate();
  if (Object.keys(errors).length) return showErrors(errors);
  if (cart.lines.some((l) => l.warning)) {
    formError.textContent = 'Ajuste os itens marcados no resumo antes de enviar.';
    formError.hidden = false;
    formError.focus();
    return;
  }
  const body = {
    items: cart.lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
    customer: { name: val('name'), phone: val('phone'), type: radio('type'), company: val('company') || null },
    fulfillment: radio('fulfillment'),
    address: { neighborhood: val('neighborhood'), city: val('city'), street: val('street') || null, complement: val('complement') || null },
    paymentMethod: radio('paymentMethod'),
    notes: val('notes'),
    couponCode: val('couponCode') || null,
    acceptPrivacy: (document.getElementById('f-privacy') as HTMLInputElement).checked,
    website: val('website'),
  };
  submit.disabled = true;
  submit.textContent = 'Enviando pedido...';
  let res: Response | null;
  let data: Record<string, unknown> = {};
  try {
    res = await fetch('/api/create-order', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    data = await res.json().catch(() => ({}));
  } catch {
    res = null;
  }
  submit.disabled = false;
  submit.textContent = 'Enviar pedido';

  if (res && res.ok && data.ok) return confirmOrder(data);

  const details = (data.details ?? {}) as { fields?: Record<string, string>; items?: { productId: string; variantId: string | null; message: string }[] };
  if (res?.status === 400 && details.fields) return showErrors(details.fields, String(data.message || 'Confira os campos destacados.'));
  if (res?.status === 409 && details.items) {
    // Marca os itens com problema de estoque no carrinho.
    const byKey = new Map(details.items.map((i) => [keyOf(i), i.message]));
    cart.replace(cart.lines.map((l) => ({ ...l, warning: byKey.get(keyOf(l)) ?? l.warning ?? null })));
    formError.textContent = `Alguns itens mudaram de disponibilidade: ${details.items.map((i) => i.message).join(' ')}`;
    formError.hidden = false;
    formError.focus();
    return;
  }
  // Falha de rede/servidor: NÃO finge sucesso. Oferece plano B claramente identificado.
  formError.textContent = String(data.message || 'Não conseguimos registrar seu pedido agora. Tente de novo em instantes.');
  formError.hidden = false;
  (document.getElementById('plan-b-link') as HTMLAnchorElement).href = whatsappLink(cfg.whatsapp, planBMessage());
  planB.hidden = false;
  formError.focus();
});

function confirmOrder(data: Record<string, unknown>) {
  done = true;
  const items = cart.lines.map((l) => ({ ...l, warning: null, info: null })) as StoredLine[];
  saveLastOrder(items, String(data.numberLabel));
  track('purchase', { transaction_id: data.numberLabel, value: Number(data.total) / 100, currency: 'BRL' });
  cart.clear();
  main.hidden = true;
  empty.hidden = true;
  const conf = document.getElementById('confirmation')!;
  conf.hidden = false;
  document.getElementById('conf-title')!.textContent = `Pedido ${data.numberLabel} recebido`;
  document.getElementById('conf-total')!.textContent = fmt(Number(data.total));
  const ship: Record<string, string> = { gratis: 'Entrega com frete grátis.', a_combinar: 'Frete a combinar no WhatsApp.', retirada: 'Retirada na loja.' };
  document.getElementById('conf-shipping')!.textContent = ship[String(data.shippingKind)] ?? '';
  const wa = document.getElementById('conf-whats') as HTMLAnchorElement;
  wa.href = String(data.whatsappUrl);
  const pix = data.pix as { payload: string; qr: string } | null;
  if (pix) {
    document.getElementById('pix-box')!.hidden = false;
    (document.getElementById('pix-qr') as HTMLImageElement).src = pix.qr;
    (document.getElementById('pix-code') as HTMLTextAreaElement).value = pix.payload;
    document.getElementById('pix-copy')!.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pix.payload);
        toast('Código Pix copiado.');
      } catch {
        (document.getElementById('pix-code') as HTMLTextAreaElement).select();
        toast('Selecione e copie o código acima.');
      }
    });
  }
  conf.focus();
  window.scrollTo({ top: 0 });
  // Tenta abrir o WhatsApp; se o navegador bloquear, o botão continua visível.
  const w = window.open(String(data.whatsappUrl), '_blank');
  if (w) w.opener = null;
  else toast('Toque em "Confirmar no WhatsApp" para enviar a mensagem.');
}

cart.subscribe(render);
render();
renderShipping();
refreshCart()
  .then((r) => {
    if (r.changed) toast('Atualizamos seu carrinho com preços e estoque atuais.');
  })
  .catch(() => {});
track('begin_checkout', { value: cart.subtotal() / 100, currency: 'BRL' });
