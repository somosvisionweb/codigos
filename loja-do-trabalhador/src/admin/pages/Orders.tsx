import { useMemo, useState } from 'preact/hooks';
import { collection, doc, getDocs, orderBy, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { api, reauthenticate } from '../api';
import { useQuery, useDoc, useSettings, isAdmin, toast, hashParams } from '../store';
import { Badge, Confirm, Empty, Loading, download } from '../ui';
import { setStatus, setPayment, historyLabel } from '../orders-util';
import { ManualSale } from './ManualSale';
import { formatBRL } from '../../lib/money';
import { formatDateTime, startOfDay, addDays, startOfYear } from '../../lib/dates';
import { formatPhone } from '../../lib/phone';
import { matchesSearch } from '../../lib/text';
import { statusLabel, paymentStatusLabel, nextStatuses } from '../../lib/orders';
import { paymentLabel, formatOrderNumber, whatsappLink } from '../../lib/whatsapp';
import { shippingLabel } from '../../lib/shipping';
import { toCsv } from '../../lib/csv';
import { ordersToRows } from '../../lib/export-rows';
import type { Order, OrderStatus, PaymentStatus } from '../../lib/types';

type Range = '30' | '90' | 'ano' | 'tudo';

export function Orders({ param }: { param: string }) {
  if (param === 'nova') return <ManualSale />;
  if (param) return <OrderDetail id={param} />;
  return <OrderList />;
}

export async function exportOrdersBackup(prefix = 'backup-pedidos'): Promise<number> {
  const snap = await getDocs(collection(db, 'orders'));
  const all = snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id }));
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  download(`${prefix}-${stamp}.json`, JSON.stringify({ exportedAt: Date.now(), orders: all }, null, 2), 'application/json');
  download(`${prefix}-${stamp}.csv`, toCsv(ordersToRows(all)), 'text/csv;charset=utf-8');
  return all.length;
}

function OrderList() {
  const params = hashParams();
  const [tab, setTab] = useState<'ativos' | 'lixeira'>(params.get('lixeira') ? 'lixeira' : 'ativos');
  const [range, setRange] = useState<Range>('90');
  const [q, setQ] = useState('');
  const [status, setStatusF] = useState<string>(params.get('status') ?? '');
  const [pay, setPay] = useState('');
  const [source, setSource] = useState('');
  const [asc, setAsc] = useState(false);
  const [confirm, setConfirm] = useState<'' | 'reset' | 'empty'>('');
  const admin = isAdmin();

  const since = useMemo(() => {
    const now = Date.now();
    if (range === '30') return addDays(startOfDay(now), -30);
    if (range === '90') return addDays(startOfDay(now), -90);
    if (range === 'ano') return startOfYear(now);
    return 0;
  }, [range]);
  const res = useQuery<Order>(query(collection(db, 'orders'), where('createdAt', '>=', since), orderBy('createdAt', 'desc')), [since]);

  const list = useMemo(() => {
    let l = res.data.filter((o) => (tab === 'lixeira' ? Boolean(o.deletedAt) : !o.deletedAt));
    if (status) l = l.filter((o) => o.status === status);
    if (pay) l = l.filter((o) => o.paymentStatus === pay);
    if (source) l = l.filter((o) => o.source === source);
    if (q.trim()) {
      const digits = q.replace(/\D/g, '');
      l = l.filter((o) => matchesSearch(`${formatOrderNumber(o.number)} ${o.number} ${o.customer?.name ?? ''}`, q) || (digits.length >= 3 && (o.customer?.phone ?? '').includes(digits)));
    }
    return asc ? [...l].reverse() : l;
  }, [res.data, tab, status, pay, source, q, asc]);

  const doReset = async (password: string) => {
    await reauthenticate(password);
    const n = await exportOrdersBackup('backup-antes-de-zerar');
    toast(`Backup de ${n} pedidos baixado (JSON e CSV).`);
    const r = await api<{ moved: number }>('reset-orders', { confirm: 'ZERAR' }, true);
    toast(`${r.moved} pedidos movidos para a lixeira. O estoque não foi alterado.`);
  };
  const doEmpty = async (password: string) => {
    await reauthenticate(password);
    const r = await api<{ deleted: number }>('empty-trash', { confirm: 'ESVAZIAR' }, true);
    toast(`${r.deleted} pedidos apagados definitivamente.`);
  };

  return (
    <div>
      <div class="page-head">
        <h1>Pedidos</h1>
        <div class="btn-row">
          <a class="btn btn-buy" href="#/pedidos/nova">+ Nova venda</a>
          {admin && tab === 'ativos' && <button class="btn" type="button" onClick={() => setConfirm('reset')}>Zerar tudo</button>}
          {admin && tab === 'lixeira' && <button class="btn btn-danger" type="button" onClick={() => setConfirm('empty')}>Esvaziar lixeira</button>}
        </div>
      </div>
      <div class="tabs" role="group" aria-label="Ver">
        <button type="button" class="tab" aria-pressed={tab === 'ativos'} onClick={() => setTab('ativos')}>Pedidos</button>
        <button type="button" class="tab" aria-pressed={tab === 'lixeira'} onClick={() => setTab('lixeira')}>Lixeira</button>
      </div>
      <div class="toolbar">
        <label class="sr-only" for="o-q">Buscar</label>
        <input id="o-q" class="input" type="search" placeholder="Buscar nº, nome ou telefone" value={q} onInput={(e) => setQ(e.currentTarget.value)} />
        <label class="sr-only" for="o-status">Status</label>
        <select id="o-status" class="select" value={status} onChange={(e) => setStatusF(e.currentTarget.value)}>
          <option value="">Todos os status</option>
          {Object.entries(statusLabel).map(([k, v]) => <option value={k}>{v}</option>)}
        </select>
        <label class="sr-only" for="o-pay">Pagamento</label>
        <select id="o-pay" class="select" value={pay} onChange={(e) => setPay(e.currentTarget.value)}>
          <option value="">Todo pagamento</option>
          {Object.entries(paymentStatusLabel).map(([k, v]) => <option value={k}>{v}</option>)}
        </select>
        <label class="sr-only" for="o-src">Origem</label>
        <select id="o-src" class="select" value={source} onChange={(e) => setSource(e.currentTarget.value)}>
          <option value="">Site e balcão</option>
          <option value="site">Site</option>
          <option value="manual">Venda manual</option>
        </select>
        <label class="sr-only" for="o-range">Período</label>
        <select id="o-range" class="select" value={range} onChange={(e) => setRange(e.currentTarget.value as Range)}>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="ano">Este ano</option>
          <option value="tudo">Todo o período</option>
        </select>
        <button type="button" class="btn" onClick={() => setAsc(!asc)}>{asc ? 'Mais antigos primeiro' : 'Mais recentes primeiro'}</button>
      </div>
      {res.loading ? <Loading /> : res.error ? <div class="alert alert-error">{res.error}</div> : list.length === 0 ? (
        <Empty>{tab === 'lixeira' ? 'A lixeira está vazia.' : 'Nenhum pedido encontrado com esses filtros.'}</Empty>
      ) : (
        <table class="table stack">
          <thead><tr><th>Nº</th><th>Data</th><th>Cliente</th><th>Status</th><th>Pagamento</th><th class="num">Total</th></tr></thead>
          <tbody>
            {list.map((o) => (
              <tr class="clickable" onClick={() => (location.hash = `#/pedidos/${o.id}`)}>
                <td data-label="Nº"><a href={`#/pedidos/${o.id}`} onClick={(e) => e.stopPropagation()}><strong>{formatOrderNumber(o.number)}</strong></a>{o.source === 'manual' && <span class="hint"> · balcão</span>}</td>
                <td data-label="Data">{formatDateTime(o.createdAt)}</td>
                <td data-label="Cliente">{o.customer?.name}</td>
                <td data-label="Status"><Badge kind={o.status}>{statusLabel[o.status]}</Badge></td>
                <td data-label="Pagamento"><Badge kind={o.paymentStatus}>{paymentStatusLabel[o.paymentStatus]}</Badge> <span class="hint">{paymentLabel[o.paymentMethod]}</span></td>
                <td data-label="Total" class="num"><strong>{formatBRL(o.total)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {confirm === 'reset' && (
        <Confirm
          title="Zerar todos os pedidos"
          danger
          word="ZERAR"
          password
          confirmLabel="Baixar backup e zerar"
          message={<><p>Antes de zerar, o painel baixa automaticamente um <strong>backup (JSON e CSV)</strong> de todos os pedidos.</p><p>Todos os pedidos vão para a <strong>lixeira</strong> e saem do faturamento. <strong>O estoque não é alterado.</strong></p></>}
          onConfirm={doReset}
          onClose={() => setConfirm('')}
        />
      )}
      {confirm === 'empty' && (
        <Confirm
          title="Esvaziar lixeira"
          danger
          word="ESVAZIAR"
          password
          confirmLabel="Apagar definitivamente"
          message={<p>Os pedidos da lixeira serão <strong>apagados para sempre</strong>. Isso não pode ser desfeito e não mexe no estoque.</p>}
          onConfirm={doEmpty}
          onClose={() => setConfirm('')}
        />
      )}
    </div>
  );
}

function OrderDetail({ id }: { id: string }) {
  const { data: o, loading } = useDoc<Order>(`orders/${id}`);
  const settings = useSettings().data;
  const admin = isAdmin();
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'' | 'cancel' | 'delete'>('');

  if (loading) return <Loading />;
  if (!o) return <Empty>Pedido não encontrado. <a href="#/pedidos">Voltar</a></Empty>;

  const run = async (fn: () => Promise<unknown>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      toast(ok);
    } catch (e) {
      toast((e as Error).message || 'Não foi possível concluir.', true);
    } finally {
      setBusy(false);
    }
  };
  const phone = o.customer?.phone ?? '';
  const num = formatOrderNumber(o.number);
  const contact = whatsappLink(phone, `Olá, ${o.customer?.name?.split(' ')[0] ?? ''}! Aqui é da Loja do Trabalhador, sobre o seu pedido ${num}.`);
  const reviewUrl = `${location.origin}/avaliar/${o.id}?t=${o.reviewToken}`;
  const reviewMsg = whatsappLink(
    phone,
    `Olá, ${o.customer?.name?.split(' ')[0] ?? ''}! Obrigado por comprar na Loja do Trabalhador (pedido ${num}). Pode contar em 1 minuto como foi sua experiência? Sua opinião ajuda muito a gente:\n${reviewUrl}`,
  );
  const next = nextStatuses(o.status, o.fulfillment);
  const deleted = Boolean(o.deletedAt);
  const cancelled = o.status === 'cancelado';

  return (
    <div class="grid" style="gap:16px">
      <div class="page-head">
        <div>
          <a href="#/pedidos">← Pedidos</a>
          <h1>Pedido {num}</h1>
          <div class="btn-row">
            <Badge kind={o.status}>{statusLabel[o.status]}</Badge>
            <Badge kind={o.paymentStatus}>{paymentStatusLabel[o.paymentStatus]}</Badge>
            {deleted && <Badge kind="danger">Na lixeira</Badge>}
            <span class="hint">{o.source === 'manual' ? 'Venda manual' : 'Pedido do site'} · {formatDateTime(o.createdAt)}</span>
          </div>
        </div>
        <div class="btn-row">
          {phone && <a class="btn btn-whats" href={contact} target="_blank" rel="noopener">Chamar no WhatsApp</a>}
          <a class="btn" href={`#/imprimir/${o.id}/cupom`}>Imprimir cupom</a>
          <a class="btn" href={`#/imprimir/${o.id}/a4`}>Romaneio A4</a>
        </div>
      </div>

      {!deleted && !cancelled && (
        <section class="card" aria-label="Ações">
          <div class="btn-row">
            {next.map((s) => (
              <button class="btn btn-primary" type="button" disabled={busy} onClick={() => run(() => setStatus(o, s), `Status: ${statusLabel[s]}`)}>
                Marcar como “{statusLabel[s]}”
              </button>
            ))}
            {o.paymentStatus !== 'pago' && <button class="btn btn-buy" type="button" disabled={busy} onClick={() => run(() => setPayment(o, 'pago'), 'Pagamento confirmado.')}>Marcar como pago</button>}
            {o.paymentStatus === 'pago' && <button class="btn" type="button" disabled={busy} onClick={() => run(() => setPayment(o, 'pendente'), 'Pagamento voltou para pendente.')}>Pagamento pendente</button>}
            {o.paymentStatus === 'pago' && admin && <button class="btn" type="button" disabled={busy} onClick={() => run(() => setPayment(o, 'reembolsado' as PaymentStatus), 'Marcado como reembolsado.')}>Reembolsado</button>}
            {o.status === 'concluido' && phone && (
              <a class="btn btn-whats" href={reviewMsg} target="_blank" rel="noopener">{o.reviewSubmitted ? 'Avaliação já recebida' : 'Pedir avaliação pelo WhatsApp'}</a>
            )}
          </div>
          {o.status !== 'concluido' && (
            <details style="margin-top:8px">
              <summary class="hint" style="cursor:pointer;min-height:32px">Mudar para outro status</summary>
              <div class="btn-row" style="margin-top:8px">
                {(['novo', 'confirmado', 'separando', 'saiu_entrega', 'pronto_retirada', 'concluido'] as OrderStatus[]).filter((s) => s !== o.status && !next.includes(s)).map((s) => (
                  <button class="btn btn-sm" type="button" disabled={busy} onClick={() => run(() => setStatus(o, s), `Status: ${statusLabel[s]}`)}>{statusLabel[s]}</button>
                ))}
              </div>
            </details>
          )}
        </section>
      )}

      <div class="two-col">
        <section class="card" aria-labelledby="itens-t">
          <h2 id="itens-t">Itens</h2>
          <table class="table">
            <thead><tr><th>Produto</th><th class="num">Qtd.</th><th class="num">Unit.</th><th class="num">Total</th></tr></thead>
            <tbody>
              {o.items.map((i) => (
                <tr><td>{i.name}{i.variantLabel && <span class="hint"> ({i.variantLabel})</span>}</td><td class="num">{i.quantity}</td><td class="num">{formatBRL(i.unitPrice)}</td><td class="num">{formatBRL(i.lineTotal)}</td></tr>
              ))}
            </tbody>
          </table>
          <dl class="kv" style="margin-top:12px">
            <dt>Subtotal</dt><dd>{formatBRL(o.subtotal)}</dd>
            {o.discount > 0 && <><dt>Desconto{o.couponCode ? ` (${o.couponCode})` : ''}</dt><dd>-{formatBRL(o.discount)}</dd></>}
            <dt>Frete</dt><dd>{shippingLabel(o.shippingKind)}</dd>
            <dt><strong>Total</strong></dt><dd><strong>{formatBRL(o.total)}</strong></dd>
            <dt>Pagamento</dt><dd>{paymentLabel[o.paymentMethod]}</dd>
          </dl>
          {o.notes && <><h3 style="margin-top:12px">Observações do cliente</h3><p style="white-space:pre-line">{o.notes}</p></>}
        </section>

        <section class="card" aria-labelledby="cli-t">
          <h2 id="cli-t">Cliente</h2>
          <dl class="kv">
            <dt>Nome</dt><dd>{o.customer?.name}</dd>
            <dt>Telefone</dt><dd>{phone ? <a href={`#/clientes/${phone}`}>{formatPhone(phone)}</a> : '—'}</dd>
            <dt>Tipo</dt><dd>{o.customer?.type === 'PJ' ? `Empresa${o.customer.company ? ` — ${o.customer.company}` : ''}` : 'Pessoa física'}</dd>
            <dt>Recebimento</dt><dd>{o.fulfillment === 'entrega' ? 'Entrega' : 'Retirada na loja'}</dd>
            {o.fulfillment === 'entrega' && <><dt>Endereço</dt><dd>{[o.address?.street, o.address?.complement].filter(Boolean).join(', ')}</dd></>}
            <dt>Bairro/Cidade</dt><dd>{[o.address?.neighborhood, o.address?.city].filter(Boolean).join(' / ') || '—'}</dd>
          </dl>
          {admin && (
            <div class="field" style="margin-top:12px">
              <label for="int-notes">Observações internas (só o painel vê)</label>
              <textarea id="int-notes" class="textarea" value={notes ?? o.internalNotes ?? ''} onInput={(e) => setNotes(e.currentTarget.value)} maxLength={1000} />
              {notes != null && notes !== (o.internalNotes ?? '') && (
                <button class="btn btn-sm" type="button" onClick={() => run(async () => { await updateDoc(doc(db, `orders/${o.id}`), { internalNotes: notes, updatedAt: Date.now() }); setNotes(null); }, 'Observação salva.')}>Salvar observação</button>
              )}
            </div>
          )}
          <h3 style="margin-top:16px">Linha do tempo</h3>
          <ol class="timeline">
            {[...(o.history ?? [])].reverse().map((h) => (
              <li><strong>{historyLabel(h)}</strong>{h.note && <span> — {h.note}</span>}<br /><span class="hint">{formatDateTime(h.at)} · {h.byName || h.by}</span></li>
            ))}
          </ol>
        </section>
      </div>

      {admin && (
        <section class="card" aria-label="Cancelar ou excluir">
          <div class="btn-row">
            {!deleted && !cancelled && <button class="btn btn-danger" type="button" disabled={busy} onClick={() => setConfirm('cancel')}>Cancelar pedido (devolve estoque)</button>}
            {!deleted && cancelled && <button class="btn btn-primary" type="button" disabled={busy} onClick={() => run(() => api('reopen-order', { orderId: o.id }), 'Pedido reaberto e estoque baixado de novo.')}>Reabrir pedido</button>}
            {!deleted && <button class="btn" type="button" disabled={busy} onClick={() => setConfirm('delete')}>Excluir (lixeira)</button>}
            {deleted && <button class="btn btn-primary" type="button" disabled={busy} onClick={() => run(() => api('trash-order', { orderId: o.id, action: 'restore' }), 'Pedido restaurado.')}>Restaurar da lixeira</button>}
          </div>
          {settings?.whatsapp && <p class="hint" style="margin:8px 0 0">Cancelar devolve o estoque. Excluir só tira o registro do faturamento.</p>}
        </section>
      )}

      {confirm === 'cancel' && (
        <Confirm title={`Cancelar pedido ${num}`} danger confirmLabel="Cancelar e devolver estoque"
          message={<p>O pedido será cancelado e <strong>os itens voltam para o estoque</strong>. Você pode reabrir depois, se houver saldo.</p>}
          onConfirm={async () => { await api('cancel-order', { orderId: o.id }); toast('Pedido cancelado. Estoque devolvido.'); }}
          onClose={() => setConfirm('')} />
      )}
      {confirm === 'delete' && (
        <Confirm title={`Excluir pedido ${num}`} danger confirmLabel="Mover para a lixeira"
          message={<><p><strong>Excluir não devolve o estoque.</strong> Se o pedido não foi entregue, cancele antes de excluir.</p><p>O pedido vai para a lixeira e sai do faturamento. Dá para restaurar.</p></>}
          onConfirm={async () => { await api('trash-order', { orderId: o.id, action: 'delete' }); toast('Pedido enviado para a lixeira.'); }}
          onClose={() => setConfirm('')} />
      )}
    </div>
  );
}
