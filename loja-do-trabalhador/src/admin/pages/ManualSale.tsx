// Nova venda manual (balcão/telefone): passa por create-order (source: manual) e baixa o estoque.
import { useMemo, useState } from 'preact/hooks';
import { collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { api } from '../api';
import { useQuery, toast } from '../store';
import { Field } from '../ui';
import { formatBRL } from '../../lib/money';
import { formatPhone } from '../../lib/phone';
import { matchesSearch } from '../../lib/text';
import { effectivePrice, stockOf } from '../../lib/catalog';
import type { Customer, Product } from '../../lib/types';

interface Line {
  productId: string;
  variantId: string | null;
  name: string;
  label: string | null;
  price: number;
  quantity: number;
  max: number;
}

export function ManualSale() {
  const products = useQuery<Product>(query(collection(db, 'products'), where('active', '==', true)), []);
  const customers = useQuery<Customer>(query(collection(db, 'customers')), []);
  const [search, setSearch] = useState('');
  const [lines, setLines] = useState<Line[]>([]);
  const [cq, setCq] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', type: 'PF' as 'PF' | 'PJ', company: '' });
  const [fulfillment, setFulfillment] = useState<'retirada' | 'entrega'>('retirada');
  const [address, setAddress] = useState({ neighborhood: '', city: '', street: '' });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro'>('dinheiro');
  const [paid, setPaid] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const found = useMemo(() => (search.trim().length < 2 ? [] : products.data.filter((p) => matchesSearch(p.name, search)).slice(0, 8)), [search, products.data]);
  const foundCustomers = useMemo(
    () => (cq.trim().length < 2 ? [] : customers.data.filter((c) => matchesSearch(`${c.name} ${c.company ?? ''}`, cq) || c.phone.includes(cq.replace(/\D/g, '') || '§')).slice(0, 6)),
    [cq, customers.data],
  );

  const add = (p: Product, variantId: string | null) => {
    const v = p.variants?.find((x) => x.id === variantId);
    const key = `${p.id}::${variantId ?? ''}`;
    setLines((ls) => {
      const ex = ls.find((l) => `${l.productId}::${l.variantId ?? ''}` === key);
      if (ex) return ls.map((l) => (l === ex ? { ...l, quantity: Math.min(l.max, l.quantity + 1) } : l));
      return [...ls, { productId: p.id, variantId, name: p.name, label: v?.label ?? null, price: effectivePrice(p), quantity: 1, max: Math.min(99, stockOf(p, variantId)) }];
    });
    setSearch('');
  };
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  const submit = async (e: Event) => {
    e.preventDefault();
    setError('');
    if (!lines.length) return setError('Adicione pelo menos um produto.');
    if (customer.name.trim().length < 2) return setError('Informe o nome do cliente (ou "Balcão").');
    setBusy(true);
    try {
      const r = await api<{ orderId: string; numberLabel: string }>('create-order', {
        source: 'manual',
        paid,
        items: lines.map((l) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
        customer: { name: customer.name, phone: customer.phone, type: customer.type, company: customer.company || null },
        fulfillment,
        address: fulfillment === 'entrega' ? address : { neighborhood: address.neighborhood, city: address.city },
        paymentMethod,
        notes,
      });
      toast(`Venda ${r.numberLabel} registrada. Estoque atualizado.`);
      location.hash = `#/pedidos/${r.orderId}`;
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <form class="grid" style="gap:16px" onSubmit={submit}>
      <div class="page-head"><div><a href="#/pedidos">← Pedidos</a><h1>Nova venda</h1></div></div>
      {error && <div class="alert alert-error" role="alert">{error}</div>}
      <section class="card form-grid">
        <h2 style="margin:0">Produtos</h2>
        <Field label="Buscar produto" id="ms-search">
          <input id="ms-search" class="input" type="search" value={search} onInput={(e) => setSearch(e.currentTarget.value)} placeholder="Digite o nome do produto" autocomplete="off" />
        </Field>
        {found.length > 0 && (
          <ul style="list-style:none;padding:0;margin:0;display:grid;gap:6px">
            {found.map((p) => (
              <li class="card" style="padding:10px">
                <strong>{p.name}</strong> <span class="hint">{formatBRL(effectivePrice(p))}</span>
                <div class="btn-row" style="margin-top:6px">
                  {p.variants?.length ? p.variants.map((v) => (
                    <button type="button" class="btn btn-sm" disabled={v.stock <= 0} onClick={() => add(p, v.id)}>{v.label} ({v.stock})</button>
                  )) : <button type="button" class="btn btn-sm" disabled={p.stock <= 0} onClick={() => add(p, null)}>Adicionar ({p.stock} em estoque)</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
        {lines.length > 0 && (
          <table class="table stack">
            <thead><tr><th>Produto</th><th>Qtd.</th><th class="num">Total</th><th></th></tr></thead>
            <tbody>
              {lines.map((l, i) => (
                <tr>
                  <td data-label="Produto">{l.name}{l.label && ` (${l.label})`}</td>
                  <td data-label="Qtd."><input class="input input-sm" type="number" min={1} max={l.max} value={l.quantity} aria-label={`Quantidade de ${l.name}`}
                    onChange={(e) => { const q = Math.max(1, Math.min(l.max, Number(e.currentTarget.value) || 1)); setLines(lines.map((x, j) => (j === i ? { ...x, quantity: q } : x))); }} /></td>
                  <td data-label="Total" class="num">{formatBRL(l.price * l.quantity)}</td>
                  <td data-label=""><button type="button" class="btn btn-sm btn-ghost" onClick={() => setLines(lines.filter((_, j) => j !== i))}>Remover</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p style="margin:0"><strong>Total: {formatBRL(total)}</strong> <span class="hint">(o servidor confere preço e estoque)</span></p>
      </section>

      <section class="card form-grid">
        <h2 style="margin:0">Cliente</h2>
        <Field label="Buscar cliente cadastrado" id="ms-cq">
          <input id="ms-cq" class="input" type="search" value={cq} onInput={(e) => setCq(e.currentTarget.value)} placeholder="Nome ou telefone" autocomplete="off" />
        </Field>
        {foundCustomers.length > 0 && (
          <div class="btn-row">
            {foundCustomers.map((c) => (
              <button type="button" class="btn btn-sm" onClick={() => { setCustomer({ name: c.name, phone: c.phone, type: c.type, company: c.company ?? '' }); setCq(''); }}>
                {c.name} · {formatPhone(c.phone)}
              </button>
            ))}
          </div>
        )}
        <div class="form-grid two">
          <Field label="Nome *" id="ms-name"><input id="ms-name" class="input" value={customer.name} onInput={(e) => setCustomer({ ...customer, name: e.currentTarget.value })} /></Field>
          <Field label="Telefone (opcional)" id="ms-phone"><input id="ms-phone" class="input" type="tel" value={customer.phone} onInput={(e) => setCustomer({ ...customer, phone: e.currentTarget.value })} /></Field>
          <Field label="Tipo" id="ms-type">
            <select id="ms-type" class="select" value={customer.type} onChange={(e) => setCustomer({ ...customer, type: e.currentTarget.value as 'PF' | 'PJ' })}>
              <option value="PF">Pessoa física</option><option value="PJ">Empresa</option>
            </select>
          </Field>
          {customer.type === 'PJ' && <Field label="Empresa" id="ms-company"><input id="ms-company" class="input" value={customer.company} onInput={(e) => setCustomer({ ...customer, company: e.currentTarget.value })} /></Field>}
        </div>
      </section>

      <section class="card form-grid">
        <h2 style="margin:0">Recebimento e pagamento</h2>
        <div class="form-grid two">
          <Field label="Recebimento" id="ms-ful">
            <select id="ms-ful" class="select" value={fulfillment} onChange={(e) => setFulfillment(e.currentTarget.value as 'retirada' | 'entrega')}>
              <option value="retirada">Retirada / balcão</option><option value="entrega">Entrega</option>
            </select>
          </Field>
          <Field label="Forma de pagamento" id="ms-pay">
            <select id="ms-pay" class="select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.currentTarget.value as 'pix' | 'cartao' | 'dinheiro')}>
              <option value="dinheiro">Dinheiro</option><option value="pix">Pix</option><option value="cartao">Cartão</option>
            </select>
          </Field>
          {fulfillment === 'entrega' && (
            <>
              <Field label="Rua e número" id="ms-street"><input id="ms-street" class="input" value={address.street} onInput={(e) => setAddress({ ...address, street: e.currentTarget.value })} /></Field>
              <Field label="Bairro" id="ms-neigh"><input id="ms-neigh" class="input" value={address.neighborhood} onInput={(e) => setAddress({ ...address, neighborhood: e.currentTarget.value })} /></Field>
              <Field label="Cidade" id="ms-city"><input id="ms-city" class="input" value={address.city} onInput={(e) => setAddress({ ...address, city: e.currentTarget.value })} /></Field>
            </>
          )}
        </div>
        <label class="check"><input type="checkbox" checked={paid} onChange={(e) => setPaid(e.currentTarget.checked)} /> Já recebi o pagamento</label>
        <Field label="Observações" id="ms-notes"><textarea id="ms-notes" class="textarea" value={notes} onInput={(e) => setNotes(e.currentTarget.value)} maxLength={500} /></Field>
        <button class="btn btn-buy" type="submit" disabled={busy}>{busy ? 'Registrando...' : `Registrar venda · ${formatBRL(total)}`}</button>
      </section>
    </form>
  );
}
