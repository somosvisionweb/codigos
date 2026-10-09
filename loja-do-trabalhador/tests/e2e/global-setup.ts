// Limpa o emulador e recria catálogo + usuários antes da suíte E2E.
import { execSync } from 'node:child_process';

export default async function globalSetup() {
  const project = process.env.FIREBASE_PROJECT_ID || 'demo-loja-trabalhador';
  const fsHost = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
  await fetch(`http://${fsHost}/emulator/v1/projects/${project}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://${authHost}/emulator/v1/projects/${project}/accounts`, { method: 'DELETE' });
  const run = (cmd: string, env: Record<string, string> = {}) =>
    execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } });
  run('npm run -s seed:emu');
  run('npm run -s create-admin:emu', { ADMIN_EMAIL: 'dono@exemplo.com', ADMIN_PASSWORD: 'senha-teste-123', ADMIN_NAME: 'Dono Teste', ADMIN_ROLE: 'admin' });
  run('npm run -s create-admin:emu', { ADMIN_EMAIL: 'vendedor@exemplo.com', ADMIN_PASSWORD: 'senha-teste-456', ADMIN_NAME: 'Vendedor Teste', ADMIN_ROLE: 'vendedor' });
  // Configurações de teste: WhatsApp, área de frete grátis e Pix preenchidos.
  const { db } = await import('../../src/server/firebase');
  await db().doc('settings/site').set(
    { whatsapp: '5511900000000', freeShippingAreas: ['Centro', 'Vila Nova'], pixKey: 'pix@exemplo.com', pixReceiverName: 'Loja do Trabalhador', pixReceiverCity: 'Cidade', city: 'Cidade Teste' },
    { merge: true },
  );
}
