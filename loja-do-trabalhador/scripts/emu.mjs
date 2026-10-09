#!/usr/bin/env node
// Roda um comando do firebase-tools (emuladores) com variáveis de proxy removidas para o tráfego local
// entre emuladores (alguns ambientes com proxy corporativo bloqueiam 127.0.0.1).
// Uso: node scripts/emu.mjs emulators:start   |   node scripts/emu.mjs emulators:exec "comando"
import { spawn } from 'node:child_process';

const env = { ...process.env };
for (const k of Object.keys(env)) {
  if (/^(https?_proxy|HTTPS?_PROXY|JAVA_TOOL_OPTIONS)$/i.test(k)) delete env[k];
}
const project = env.FIREBASE_EMULATOR_PROJECT || 'demo-loja-trabalhador';
const args = ['firebase', ...process.argv.slice(2), '--project', project];
const child = spawn('npx', args, { stdio: 'inherit', env });
child.on('exit', (code) => process.exit(code ?? 1));
