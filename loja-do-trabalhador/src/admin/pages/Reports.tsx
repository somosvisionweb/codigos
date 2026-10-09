import { useMemo, useState } from 'preact/hooks';
import { collection, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useQuery } from '../store';
import { Loading, download } from '../ui';
import { summarize, topProducts } from '../metrics';
import { formatBRL } from '../../lib/money';
import { addDays, dayKey, parseDayKey, startOfDay, formatDate } from '../../lib/dates';
import { stockOf } from '../../lib/catalog';
import { toCsv } from '../../lib/csv';
import { ordersToRows, productsToRows } from '../../lib/export-rows';
import type { Order, Product } from '../../lib/types';

export function Reports() {
  const now = Date.now();
  const [from, setFrom] = useState(dayKey(addDays(startOfDay(now), -30)));
  const [to, setTo] = useState(dayKey(now));
  const start = parseDayKey(from);
  const end = addDays(parseDayKey(to), 1);
  const orders = useQuery<Order>(query(collection(db, 'orders'), where('createdAt', '>=', start), orderBy('createdAt', 'desc')), [start]);
  const products = useQuery<Product>(query(collection(db, 'products')), []);

  const inRange = useMemo(() => orders.data.filter((o) => o.createdAt < end), [orders.data, end]);
  const s = summarize(inRange, start, end);
  const byProduct = topProducts(inRange, start, end, 1000);
  const sold = new Set(byProduct.map((p) => p.productId));
  const stalled = products.data.filter((p) => p.active && !sold.has(p.id));
  // Curva ABC simples por faturamento: A = até 80%, B = até 95%, C = resto.
  const totalRev = byProduct.reduce((t, p) => t + p.revenue, 0);
  let acc = 0;
  const abc = byProduct.map((p) => {
    acc += p.revenue;
    const share = totalRev ? acc / totalRev : 1;
    return { ...p, cls: share <= 0.8 ? 'A' : share <= 0.95 ? 'B' : 'C' };
  });
  const stockById = Object.fromEntries(products.data.map((p) => [p.id, stockOf(p)]));
  const stamp = `${from}_a_${to}`;

  if (orders.loading) return <Loading />;
  return (
    <div class="grid" style="gap:16px">
      <div class="page-head"><h1>Relatórios</h1></div>
      <section class="card form-grid">
        <div class="form-grid two">
          <div class="field"><label for="r-from">De</label><input id="r-from" class="input" type="date" value={from} onChange={(e) => setFrom(e.currentTarget.value)} /></div>
          <div class="field"><label for="r-to">Até</label><input id="r-to" class="input" type="date" value={to} onChange={(e) => setTo(e.currentTarget.value)} /></div>
        </div>
        <div class="metrics">
          <div class="metric"><div class="label">Vendido</div><div class="value">{formatBRL(s.sold)}</div></div>
          <div class="metric"><div class="label">Recebido</div><div class="value">{formatBRL(s.received)}</div></div>
          <div class="metric"><div class="label">Pedidos</div><div class="value">{s.count}</div></div>
          <div class="metric"><div class="label">Ticket médio</div><div class="value">{formatBRL(s.avgTicket)}</div></div>
        </div>
        <div class="btn-row">
          <button class="btn" type="button" onClick={() => download(`pedidos-${stamp}.csv`, toCsv(ordersToRows(inRange)), 'text/csv;charset=utf-8')}>Exportar pedidos (CSV)</button>
          <button class="btn" type="button" onClick={() => download(`produtos-${dayKey(now)}.csv`, toCsv(productsToRows(products.data)), 'text/csv;charset=utf-8')}>Exportar produtos (CSV)</button>
          <a class="btn" href="#/clientes">Exportar clientes</a>
        </div>
      </section>
      <section class="card">
        <h2>Vendas por produto e curva ABC</h2>
        <p class="hint">A = produtos que somam até 80% do faturamento do período; B = próximos 15%; C = o restante.</p>
        {abc.length === 0 ? <p class="muted">Sem vendas no período.</p> : (
          <table class="table stack">
            <thead><tr><th>Produto</th><th>Curva</th><th class="num">Qtd.</th><th class="num">Faturamento</th><th class="num">Estoque atual</th></tr></thead>
            <tbody>{abc.map((p) => <tr><td data-label="Produto">{p.name}</td><td data-label="Curva"><strong>{p.cls}</strong></td><td data-label="Qtd." class="num">{p.quantity}</td><td data-label="Faturamento" class="num">{formatBRL(p.revenue)}</td><td data-label="Estoque" class="num">{stockById[p.productId] ?? '—'}</td></tr>)}</tbody>
          </table>
        )}
      </section>
      <section class="card">
        <h2>Produtos parados ({formatDate(start)} a {formatDate(end - 1)})</h2>
        <p class="hint">Produtos ativos sem nenhuma venda no período.</p>
        {stalled.length === 0 ? <p class="muted">Todos os produtos ativos venderam no período.</p> : (
          <ul style="margin:0;padding-left:18px">{stalled.map((p) => <li><a href={`#/produtos/${p.id}`}>{p.name}</a> <span class="hint">· estoque {stockOf(p)}</span></li>)}</ul>
        )}
      </section>
    </div>
  );
}
