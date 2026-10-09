import { useMemo, useState } from 'preact/hooks';
import { collection, doc, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { api } from '../api';
import { useQuery, useDoc, isAdmin, toast } from '../store';
import { Badge, Confirm, Empty, Loading, download } from '../ui';
import { formatBRL } from '../../lib/money';
import { formatPhone } from '../../lib/phone';
import { formatDate, formatDateTime } from '../../lib/dates';
import { matchesSearch } from '../../lib/text';
import { toCsv } from '../../lib/csv';
import { customersToRows } from '../../lib/export-rows';
import { statusLabel } from '../../lib/orders';
import { formatOrderNumber, whatsappLink } from '../../lib/whatsapp';
import type { Customer, Order } from '../../lib/types';

export function Customers({ param }: { param: string }) {
  return param ? <CustomerDetail phone={param} /> : <CustomerList />;
}

function CustomerList() {
  const res = useQuery<Customer>(query(collection(db, 'customers')), []);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const list = useMemo(() => {
    let l = [...res.data].sort((a, b) => (b.lastOrderAt ?? 0) - (a.lastOrderAt ?? 0));
    if (type) l = l.filter((c) => c.type === type);
    if (q.trim()) {
      const d = q.replace(/\D/g, '');
      l = l.filter((c) => matchesSearch(`${c.name} ${c.company ?? ''}`, q) || (d.length >= 3 && c.phone.includes(d)));
    }
    return l;
  }, [res.data, q, type]);
  const exportCsv = () => download(`clientes-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(customersToRows(res.data)), 'text/csv;charset=utf-8');
  return (
    <div>
      <div class="page-head">
        <h1>Clientes</h1>
        {isAdmin() && <button class="btn" type="button" onClick={exportCsv}>Exportar CSV</button>}
      </div>
      <div class="toolbar">
        <label class="sr-only" for="c-q">Buscar</label>
        <input id="c-q" class="input" type="search" placeholder="Nome, empresa ou telefone" value={q} onInput={(e) => setQ(e.currentTarget.value)} />
        <label class="sr-only" for="c-t">Tipo</label>
        <select id="c-t" class="select" value={type} onChange={(e) => setType(e.currentTarget.value)}>
          <option value="">PF e PJ</option><option value="PF">Pessoa física</option><option value="PJ">Empresa</option>
        </select>
      </div>
      {res.loading ? <Loading /> : list.length === 0 ? <Empty>Os clientes aparecem aqui automaticamente a cada pedido.</Empty> : (
        <table class="table stack">
          <thead><tr><th>Cliente</th><th>Telefone</th><th class="num">Pedidos</th><th class="num">Total gasto</th><th>Último pedido</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr class="clickable" onClick={() => (location.hash = `#/clientes/${c.id}`)}>
                <td data-label="Cliente"><a href={`#/clientes/${c.id}`} onClick={(e) => e.stopPropagation()}><strong>{c.name}</strong></a>{c.type === 'PJ' && <span class="hint"> · {c.company || 'Empresa'}</span>}</td>
                <td data-label="Telefone">{formatPhone(c.phone)}</td>
                <td data-label="Pedidos" class="num">{c.ordersCount}</td>
                <td data-label="Total gasto" class="num">{formatBRL(c.totalSpent)}</td>
                <td data-label="Último pedido">{formatDate(c.lastOrderAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CustomerDetail({ phone }: { phone: string }) {
  const { data: c, loading } = useDoc<Customer>(`customers/${phone}`);
  const orders = useQuery<Order>(query(collection(db, 'orders'), where('customer.phone', '==', phone)), [phone]);
  const [notes, setNotes] = useState<string | null>(null);
  const [anon, setAnon] = useState(false);
  const admin = isAdmin();
  if (loading) return <Loading />;
  if (!c) return <Empty>Cliente não encontrado. <a href="#/clientes">Voltar</a></Empty>;
  const sorted = [...orders.data].sort((a, b) => b.createdAt - a.createdAt);
  return (
    <div class="grid" style="gap:16px">
      <div class="page-head">
        <div><a href="#/clientes">← Clientes</a><h1>{c.name}</h1><span class="hint">{c.type === 'PJ' ? `Empresa${c.company ? ` — ${c.company}` : ''}` : 'Pessoa física'}</span></div>
        <a class="btn btn-whats" href={whatsappLink(c.phone, `Olá, ${c.name.split(' ')[0]}! Aqui é da Loja do Trabalhador.`)} target="_blank" rel="noopener">Chamar no WhatsApp</a>
      </div>
      <section class="metrics">
        <div class="metric"><div class="label">Pedidos</div><div class="value">{c.ordersCount}</div></div>
        <div class="metric"><div class="label">Total gasto</div><div class="value">{formatBRL(c.totalSpent)}</div></div>
        <div class="metric"><div class="label">Último pedido</div><div class="value" style="font-size:1.2rem">{formatDate(c.lastOrderAt)}</div></div>
        <div class="metric"><div class="label">Telefone</div><div class="value" style="font-size:1.2rem">{formatPhone(c.phone)}</div></div>
      </section>
      <div class="two-col">
        <section class="card">
          <h2>Histórico de pedidos</h2>
          {sorted.length === 0 ? <p class="muted">Nenhum pedido.</p> : (
            <table class="table stack">
              <thead><tr><th>Nº</th><th>Data</th><th>Status</th><th class="num">Total</th></tr></thead>
              <tbody>
                {sorted.map((o) => (
                  <tr class="clickable" onClick={() => (location.hash = `#/pedidos/${o.id}`)}>
                    <td data-label="Nº"><a href={`#/pedidos/${o.id}`}>{formatOrderNumber(o.number)}</a>{o.deletedAt ? <span class="hint"> (lixeira)</span> : null}</td>
                    <td data-label="Data">{formatDateTime(o.createdAt)}</td>
                    <td data-label="Status"><Badge kind={o.status}>{statusLabel[o.status]}</Badge></td>
                    <td data-label="Total" class="num">{formatBRL(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        <section class="card form-grid">
          <h2 style="margin:0">Dados</h2>
          {c.emails?.length > 0 && <p style="margin:0">E-mail: {c.emails.join(', ')}</p>}
          {c.addresses?.length > 0 && (
            <div><strong>Endereços</strong><ul style="margin:4px 0 0;padding-left:18px">{c.addresses.map((a) => <li>{[a.street, a.neighborhood, a.city].filter(Boolean).join(' — ')}</li>)}</ul></div>
          )}
          {admin && (
            <>
              <div class="field">
                <label for="cu-notes">Observações internas</label>
                <textarea id="cu-notes" class="textarea" value={notes ?? c.internalNotes ?? ''} onInput={(e) => setNotes(e.currentTarget.value)} maxLength={2000} />
              </div>
              {notes != null && (
                <button class="btn btn-primary" type="button" onClick={async () => { await updateDoc(doc(db, `customers/${c.id}`), { internalNotes: notes, updatedAt: Date.now() }); setNotes(null); toast('Observação salva.'); }}>Salvar observação</button>
              )}
              <hr style="border:0;border-top:1px solid var(--line);width:100%" />
              <button class="btn btn-danger" type="button" onClick={() => setAnon(true)}>Anonimizar cliente (LGPD)</button>
            </>
          )}
        </section>
      </div>
      {anon && (
        <Confirm title="Anonimizar cliente" danger word="ANONIMIZAR" confirmLabel="Anonimizar"
          message={<><p>Remove nome, telefone, e-mail e endereço deste cliente <strong>de todos os pedidos</strong> e apaga a ficha. Os valores dos pedidos continuam no faturamento.</p><p>Use quando o cliente pedir a exclusão dos dados. Não pode ser desfeito.</p></>}
          onConfirm={async () => { await api('anonymize-customer', { phone: c.phone, confirm: 'ANONIMIZAR' }); toast('Cliente anonimizado.'); location.hash = '#/clientes'; }}
          onClose={() => setAnon(false)} />
      )}
    </div>
  );
}
