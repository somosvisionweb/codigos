// npm run create-admin — cria (ou promove) um usuário do painel.
// Lê e-mail, senha, nome e papel de variáveis de ambiente ou pergunta no terminal.
//   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_ROLE (admin | vendedor)
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { adminAuth, db, usingEmulator } from '../src/server/firebase';

async function ask(question: string, hidden = false): Promise<string> {
  const rl = createInterface({ input: stdin, output: stdout, terminal: true });
  if (hidden) {
    // Esconde a digitação da senha.
    const write = (rl as unknown as { _writeToOutput: (s: string) => void });
    write._writeToOutput = (s: string) => { if (s.includes(question)) stdout.write(s); else stdout.write('*'); };
  }
  const answer = await rl.question(question);
  rl.close();
  if (hidden) stdout.write('\n');
  return answer.trim();
}

async function main() {
  console.log(usingEmulator() ? '→ Usando o EMULADOR do Auth/Firestore' : '→ Usando o projeto Firebase REAL');
  const email = process.env.ADMIN_EMAIL || (await ask('E-mail: '));
  const password = process.env.ADMIN_PASSWORD || (await ask('Senha (mín. 8 caracteres): ', true));
  const fromEnv = Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
  const name = process.env.ADMIN_NAME || (fromEnv ? '' : await ask('Nome: ')) || email.split('@')[0];
  const roleInput = process.env.ADMIN_ROLE || (fromEnv ? '' : await ask('Papel [admin/vendedor] (admin): ')) || 'admin';
  const role = roleInput === 'vendedor' ? 'vendedor' : 'admin';

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('E-mail inválido.');
  if (password.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.');

  let uid: string;
  try {
    const existing = await adminAuth().getUserByEmail(email);
    uid = existing.uid;
    await adminAuth().updateUser(uid, { password, displayName: name, disabled: false });
    console.log('• Usuário já existia no Auth: senha e nome atualizados.');
  } catch {
    const user = await adminAuth().createUser({ email, password, displayName: name, emailVerified: true });
    uid = user.uid;
    console.log('• Usuário criado no Auth.');
  }
  await db().doc(`admins/${uid}`).set({ role, name, email, active: true }, { merge: true });
  console.log(`✔ ${email} pode entrar no painel como "${role}".`);
}

main().then(() => process.exit(0)).catch((e) => { console.error('✖', e.message); process.exit(1); });
