// npm run seed:demo — SOMENTE para ambiente local/emulador.
// Cria 3 depoimentos FICTÍCIOS marcados com demo: true para testar o layout.
// O site em produção nunca exibe registros demo (filtro no servidor + teste automatizado).
import { db, usingEmulator } from '../src/server/firebase';

async function main() {
  if (!usingEmulator()) {
    console.error('✖ seed:demo só roda com o emulador (FIRESTORE_EMULATOR_HOST). Abortado.');
    process.exit(1);
  }
  const now = Date.now();
  const demos = [
    { id: 'demo-1', name: 'DEMONSTRAÇÃO Cliente A', text: '[DEMONSTRAÇÃO] Texto fictício para testar o layout do depoimento.', rating: 5, source: 'compra_verificada' },
    { id: 'demo-2', name: 'DEMONSTRAÇÃO Cliente B', text: '[DEMONSTRAÇÃO] Outro texto fictício, um pouco maior, para ver como a quebra de linha fica no cartão.', rating: 4, source: 'whatsapp' },
    { id: 'demo-3', name: 'DEMONSTRAÇÃO Cliente C', text: '[DEMONSTRAÇÃO] Depoimento fictício de exemplo.', rating: 5, source: 'instagram' },
  ];
  for (const [i, d] of demos.entries()) {
    await db().doc(`testimonials/${d.id}`).set({
      name: d.name, displayName: d.name, role: 'DEMONSTRAÇÃO', text: d.text, rating: d.rating, source: d.source,
      orderId: null, productId: null, imageUrl: null, consent: true, status: 'aprovado', featured: false,
      order: i, demo: true, createdAt: now, updatedAt: now,
    });
  }
  console.log('✔ 3 depoimentos de DEMONSTRAÇÃO criados (demo: true). Para vê-los no site local, rode com SHOW_DEMO_TESTIMONIALS=true.');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
