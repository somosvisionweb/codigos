import { useMemo, useState } from 'preact/hooks';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useQuery, isAdmin, newOrdersCount } from '../store';
import { Loading } from '../ui';
import { summarize, periodStarts, dailySeries, topProducts } from '../metrics';
import { formatBRL } from '../../lib/money';
import { addDays, startOfDay, parseDayKey, dayKey, formatDate } from '../../lib/dates';
import { isLowStock } from '../../lib/catalog';
import { soundEnabled } from '../App';
import type { Lead, Order, Product, Testimonial } from '../../lib/types';

type Period = 'hoje' | '7d' | 'mes' | 'ano' | 'custom';

export function Dashboard() {
  const now = Date.now();
  const starts = periodStarts(now);
  const [period, setPeriod] = useState<Period>('mes');
  const [from, setFrom] = useState(dayKey(addDays(now, -30)));
  const [to, setTo] = useState(dayKey(now));
  const customFrom = parseDayKey(from);
  const since = Math.min(starts.year, addDays(startOfDay(now), -30), period === 'custom' ? customFrom : Infinity);

  const orders = useQuery<Order>(query(collection(db, 'orders'), where('createdAt', '>=', since), orderBy('createdAt', 'desc')), [since]);
  const products = useQuery<Product>(query(collection(db, 'products')), []);
  const admin = isAdmin();
  const leads = useQuery<Lead>(admin ? query(collection(db, 'leads'), where('status', '==', 'novo')) : null, [admin]);
  const pending = useQuery<Testimonial>(admin ? query(collection(db, 'testimonials'), where('status', '==', 'pendente')) : null, [admin]);
  const [sound, setSound] = useState(soundEnabled());

  const range = useMemo((): [number, number, string] => {
    switch (period) {
      case 'hoje': return [starts.today, Infinity, 'Hoje'];
      case '7d': return [addDays(starts.today, -6), Infinity, 'Últimos 7 dias'];
      case 'ano': return [starts.year, Infinity, 'Este ano'];
      case 'custom': return [customFrom, addDays(parseDayKey(to), 1), `${formatDate(customFrom)} a ${formatDate(parseDayKey(to))}`];
      default: return [starts.month, Infinity, 'Este mês'];
    }
  }, [period, from, to, starts.today]);

  if (orders.loading) return <Loading />;
  const list = orders.data;
  const s = summarize(list, range[0], range[1]);
  const fixed = [
    { label: 'Vendido hoje', v: summarize(list, starts.today).sold },
    { label: 'Na semana', v: summarize(list, starts.week).sold },
    { label: 'No mês', v: summarize(list, starts.month).sold },
    { label: 'No ano', v: summarize(list, starts.year).sold },
  ];
  const low = products.data.filter((p) => p.active && isLowStock(p));
  const series = dailySeries(list, 30, now);
  const top = topProducts(list, range[0], range[1]);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    try {
      localStorage.setItem('ldt_admin_sound', next ? '1' : '0');
    } catch {
      /* ignora */
    }
  };

  return (
    <div class="grid" style="gap:16px">
      <div class="page-head">
        <h1>Início</h1>
        <label class="check"><input type="checkbox" checked={sound} onChange={toggleSound} /> Aviso sonoro de pedido novo</label>
      </div>

      <section class="metrics" aria-label="Vendas">
        {fixed.map((m) => (
          <div class="metric"><div class="label">{m.label}</div><div class="value">{formatBRL(m.v)}</div></div>
        ))}
      </section>

      <section class="shortcuts" aria-label="Atalhos">
        <a class={`shortcut${newOrdersCount.value ? ' alert' : ''}`} href="#/pedidos?status=novo"><strong>{newOrdersCount.value}</strong> Pedidos novos</a>
        <a class={`shortcut${low.length ? ' alert' : ''}`} href="#/produtos?filtro=baixo"><strong>{low.length}</strong> Estoque baixo</a>
        {admin && <a class={`shortcut${leads.data.length ? ' alert' : ''}`} href="#/orcamentos"><strong>{leads.data.length}</strong> Orçamentos novos</a>}
        {admin && <a class={`shortcut${pending.data.length ? ' alert' : ''}`} href="#/depoimentos"><strong>{pending.data.length}</strong> Depoimentos para aprovar</a>}
      </section>

      <section class="card" aria-labelledby="periodo-t">
        <div class="page-head" style="margin-bottom:8px">
          <h2 id="periodo-t" style="margin:0">Período: {range[2]}</h2>
        </div>
        <div class="tabs" role="group" aria-label="Escolher período">
          {([['hoje', 'Hoje'], ['7d', '7 dias'], ['mes', 'Mês'], ['ano', 'Ano'], ['custom', 'Personalizado']] as [Period, string][]).map(([k, l]) => (
            <button type="button" class="tab" aria-pressed={period === k} onClick={() => setPeriod(k)}>{l}</button>
          ))}
        </div>
        {period === 'custom' && (
          <div class="form-grid two" style="margin-bottom:12px">
            <div class="field"><label for="d-from">De</label><input id="d-from" class="input" type="date" value={from} onChange={(e) => setFrom(e.currentTarget.value)} /></div>
            <div class="field"><label for="d-to">Até</label><input id="d-to" class="input" type="date" value={to} onChange={(e) => setTo(e.currentTarget.value)} /></div>
          </div>
        )}
        <div class="metrics">
          <div class="metric"><div class="label">Vendido</div><div class="value">{formatBRL(s.sold)}</div></div>
          <div class="metric"><div class="label">Recebido</div><div class="value">{formatBRL(s.received)}</div><div class="sub">pagamento confirmado</div></div>
          <div class="metric"><div class="label">A receber</div><div class="value">{formatBRL(s.receivable)}</div></div>
          <div class="metric"><div class="label">Pedidos · ticket médio</div><div class="value">{s.count}</div><div class="sub">{formatBRL(s.avgTicket)} por pedido</div></div>
        </div>
      </section>

      <div class="two-col">
        <section class="card" aria-labelledby="chart-t">
          <h2 id="chart-t">Vendas dos últimos 30 dias</h2>
          <BarChart data={series} />
        </section>
        <section class="card" aria-labelledby="top-t">
          <h2 id="top-t">Top 5 produtos ({range[2].toLowerCase()})</h2>
          {top.length === 0 ? <p class="muted">Nenhuma venda no período.</p> : (
            <table class="table">
              <thead><tr><th>Produto</th><th class="num">Qtd.</th><th class="num">Valor</th></tr></thead>
              <tbody>
                {top.map((t) => <tr><td>{t.name}</td><td class="num">{t.quantity}</td><td class="num">{formatBRL(t.revenue)}</td></tr>)}
              </tbody>
            </table>
          )}
          {low.length > 0 && (
            <>
              <h3 style="margin-top:16px">Estoque baixo</h3>
              <ul style="margin:0;padding-left:18px">
                {low.slice(0, 6).map((p) => <li><a href={`#/produtos/${p.id}`}>{p.name}</a></li>)}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

/** Barras de série única (cor da marca), topo arredondado, tooltip no hover/foco e tabela alternativa. */
function BarChart({ data }: { data: { key: string; start: number; total: number; count: number }[] }) {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [table, setTable] = useState(false);
  const W = 600;
  const H = 220;
  const pad = { l: 8, r: 8, t: 12, b: 24 };
  const max = Math.max(1, ...data.map((d) => d.total));
  const bw = (W - pad.l - pad.r) / data.length;
  const total = data.reduce((s, d) => s + d.total, 0);
  const label = (d: (typeof data)[number]) => `${formatDate(d.start)}: ${formatBRL(d.total)} (${d.count} ${d.count === 1 ? 'pedido' : 'pedidos'})`;
  return (
    <div class="chart">
      <p class="muted" style="margin:0 0 8px">Total: <strong>{formatBRL(total)}</strong> · maior dia: {formatBRL(max === 1 && total === 0 ? 0 : max)}</p>
      {!table && (
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Gráfico de barras: vendas por dia, total ${formatBRL(total)}`} onMouseLeave={() => setTip(null)}>
          {[0.5, 1].map((f) => <line class="grid-line" x1={pad.l} x2={W - pad.r} y1={pad.t + (H - pad.t - pad.b) * (1 - f)} y2={pad.t + (H - pad.t - pad.b) * (1 - f)} />)}
          <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="#c9d4df" />
          {data.map((d, i) => {
            const h = d.total > 0 ? Math.max(3, ((H - pad.t - pad.b) * d.total) / max) : 0;
            const x = pad.l + i * bw + 1;
            const y = H - pad.b - h;
            const w = Math.max(2, bw - 2);
            const r = Math.min(4, w / 2, h);
            const path = h > 0 ? `M${x},${H - pad.b} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${H - pad.b} Z` : '';
            const show = (ev: Event) => {
              const svg = (ev.currentTarget as SVGElement).ownerSVGElement!.getBoundingClientRect();
              setTip({ x: ((x + w / 2) / W) * svg.width, y: (Math.min(y, H - pad.b - 4) / H) * svg.height, text: label(d) });
            };
            return (
              <g>
                {/* área de toque maior que a barra */}
                <rect x={pad.l + i * bw} y={pad.t} width={bw} height={H - pad.t - pad.b} fill="transparent" onMouseEnter={show} onClick={show} />
                {path && <path class="bar" d={path} tabIndex={0} aria-label={label(d)} onFocus={show} onBlur={() => setTip(null)} onMouseEnter={show} />}
                {i % 5 === 0 && <text class="axis" x={x + w / 2} y={H - 8} text-anchor="middle">{d.key.slice(8, 10)}/{d.key.slice(5, 7)}</text>}
              </g>
            );
          })}
        </svg>
      )}
      {tip && !table && <div class="chart-tip" style={{ left: `${tip.x}px`, top: `${tip.y}px` }}>{tip.text}</div>}
      {table && (
        <table class="table">
          <thead><tr><th>Dia</th><th class="num">Pedidos</th><th class="num">Vendido</th></tr></thead>
          <tbody>{data.filter((d) => d.count).map((d) => <tr><td>{formatDate(d.start)}</td><td class="num">{d.count}</td><td class="num">{formatBRL(d.total)}</td></tr>)}</tbody>
        </table>
      )}
      <button type="button" class="btn btn-ghost btn-sm" onClick={() => setTable(!table)}>{table ? 'Ver gráfico' : 'Ver como tabela'}</button>
    </div>
  );
}
