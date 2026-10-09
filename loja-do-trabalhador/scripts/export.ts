// npm run export — baixa um backup completo (JSON) e CSVs de pedidos, clientes e produtos em ./backups/<data>/
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { db, usingEmulator } from '../src/server/firebase';
import { toCsv } from '../src/lib/csv';
import { ordersToRows, customersToRows, productsToRows } from '../src/lib/export-rows';

const COLLECTIONS = ['settings', 'categories', 'products', 'orders', 'customers', 'leads', 'testimonials', 'banners', 'coupons', 'admins', 'auditLog', 'counters'];

async function main() {
  console.log(usingEmulator() ? '→ Exportando do EMULADOR' : '→ Exportando do Firestore REAL');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = join('backups', stamp);
  mkdirSync(dir, { recursive: true });
  const all: Record<string, unknown[]> = {};
  for (const name of COLLECTIONS) {
    const snap = await db().collection(name).get();
    all[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  writeFileSync(join(dir, 'backup-completo.json'), JSON.stringify({ exportedAt: Date.now(), collections: all }, null, 2));
  writeFileSync(join(dir, 'pedidos.csv'), toCsv(ordersToRows(all.orders as never)));
  writeFileSync(join(dir, 'clientes.csv'), toCsv(customersToRows(all.customers as never)));
  writeFileSync(join(dir, 'produtos.csv'), toCsv(productsToRows(all.products as never)));
  console.log(`✔ Backup salvo em ${dir}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error('✖', e.message); process.exit(1); });
