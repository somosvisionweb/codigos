// npm run seed — cria categorias, configurações (com placeholders TODO_) e o catálogo inicial.
// Idempotente: documentos já existentes não são sobrescritos (preço/estoque editados no painel ficam).
import { db, usingEmulator } from '../src/server/firebase';
import { categories, products, defaultSettings } from './catalog-data';
import { slugify } from '../src/lib/text';
import type { Product } from '../src/lib/types';

async function main() {
  const fs = db();
  console.log(usingEmulator() ? '→ Usando o EMULADOR do Firestore' : '→ Usando o Firestore REAL do projeto');
  let created = 0;
  let skipped = 0;

  // Configurações: cria se não existir; se existir, só completa campos novos.
  const settingsRef = fs.doc('settings/site');
  const settingsSnap = await settingsRef.get();
  if (!settingsSnap.exists) {
    await settingsRef.set({ ...defaultSettings, updatedAt: Date.now() });
    created++;
  } else {
    const current = settingsSnap.data() ?? {};
    const missing = Object.fromEntries(Object.entries(defaultSettings).filter(([k]) => !(k in current)));
    if (Object.keys(missing).length) await settingsRef.set(missing, { merge: true });
    skipped++;
  }

  for (const c of categories) {
    const ref = fs.doc(`categories/${c.slug}`);
    if ((await ref.get()).exists) { skipped++; continue; }
    await ref.set(c);
    created++;
  }

  const now = Date.now();
  for (const p of products) {
    const ref = fs.doc(`products/${p.slug}`);
    if ((await ref.get()).exists) { skipped++; continue; }
    const variants = (p.options ?? []).map((label, i) => ({
      id: slugify(label) || String(i),
      label,
      stock: p.variantStocks?.[i] ?? 0,
    }));
    const doc: Omit<Product, 'id'> = {
      name: p.name,
      slug: p.slug,
      categoryId: p.category,
      shortDescription: p.short,
      description: p.description,
      specs: (p.specs ?? []).map(([label, value]) => ({ label, value })),
      price: Math.round(p.price * 100),
      promoPrice: p.promoPrice ? Math.round(p.promoPrice * 100) : null,
      unit: p.unit,
      images: [],
      placeholder: `/images/produtos/${p.slug}.webp`,
      variantLabel: p.variantLabel ?? '',
      variants,
      stock: variants.length ? variants.reduce((s, v) => s + v.stock, 0) : p.stock,
      minStock: p.minStock ?? 5,
      ca: null,
      active: true,
      featured: Boolean(p.featured),
      relatedIds: [],
      isKit: Boolean(p.isKit),
      createdAt: now,
      updatedAt: now,
      createdBy: 'seed',
    };
    await ref.set(doc);
    created++;
  }

  const counter = fs.doc('counters/orders');
  if (!(await counter.get()).exists) await counter.set({ value: 0 });

  console.log(`✔ Seed concluído: ${created} criados, ${skipped} já existiam (mantidos).`);
  console.log('  Nenhum depoimento foi criado (depoimentos só de clientes reais).');
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('✖ Falha no seed:', e.message);
  process.exit(1);
});
