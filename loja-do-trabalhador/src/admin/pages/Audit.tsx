import { useState } from 'preact/hooks';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useQuery, toast } from '../store';
import { Loading, download } from '../ui';
import { formatDateTime } from '../../lib/dates';
import type { AuditEntry } from '../../lib/types';

const COLLECTIONS = ['settings', 'categories', 'products', 'orders', 'customers', 'leads', 'testimonials', 'banners', 'coupons', 'admins', 'auditLog'];

export function Audit() {
  const res = useQuery<AuditEntry>(query(collection(db, 'auditLog'), orderBy('at', 'desc'), limit(200)), []);
  const [busy, setBusy] = useState(false);
  const backup = async () => {
    setBusy(true);
    try {
      const all: Record<string, unknown[]> = {};
      for (const c of COLLECTIONS) {
        const snap = await getDocs(collection(db, c));
        all[c] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      download(`backup-completo-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ exportedAt: Date.now(), collections: all }, null, 2), 'application/json');
      toast('Backup baixado. Guarde em local seguro (contém dados de clientes).');
    } catch (e) {
      toast((e as Error).message, true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div class="grid" style="gap:16px">
      <div class="page-head">
        <h1>Auditoria e backup</h1>
        <button class="btn btn-primary" type="button" onClick={backup} disabled={busy}>{busy ? 'Gerando...' : 'Baixar backup completo (JSON)'}</button>
      </div>
      <p class="hint" style="margin:0">Registro das ações sensíveis: exclusões, zerar pedidos, mudanças de preço e estoque, configurações. Últimas 200.</p>
      {res.loading ? <Loading /> : (
        <table class="table stack">
          <thead><tr><th>Quando</th><th>Quem</th><th>Ação</th><th>Detalhe</th></tr></thead>
          <tbody>
            {res.data.map((a) => (
              <tr><td data-label="Quando">{formatDateTime(a.at)}</td><td data-label="Quem">{a.byName || a.by}</td><td data-label="Ação"><code>{a.action}</code></td><td data-label="Detalhe">{a.summary}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
