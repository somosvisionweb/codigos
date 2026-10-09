# Decisões tomadas durante o desenvolvimento

Registro das escolhas feitas por conta própria e o motivo de cada uma.

## Estrutura

- **Projeto na pasta `loja-do-trabalhador/`** do repositório `codigos`. O repositório já existia (com o site da VisionWeb na raiz), então não rodei `git init` de novo: o projeto fica isolado nesta pasta e o Netlify usa `loja-do-trabalhador` como *base directory*.
- **Datas como epoch em milissegundos (`number`)** em vez de `Timestamp` do Firestore. Simplifica tipos compartilhados entre site, painel e funções, ordenação e exportação CSV/JSON. As funções de servidor gravam `Date.now()` do servidor.
- **Dinheiro sempre em centavos inteiros** (`2490` = R$ 24,90), conforme o briefing.

## Segurança e regras

- Regras do Firestore negam tudo por padrão; o site público não usa o SDK do Firebase no navegador (lê no servidor com `firebase-admin`), mas as regras de leitura pública existem e são testadas.
- **Mudança de status pelo painel é feita direto no Firestore**, protegida por regra (`affectedKeys().hasOnly([...])`). Cancelar, reabrir, excluir/restaurar (lixeira), zerar, esvaziar lixeira e anonimizar cliente passam por funções de servidor porque mexem em estoque ou nos totais do cliente.
- **Storage verifica o papel do usuário lendo `admins/{uid}` no Firestore** (regra entre serviços). Em produção o Firebase pede, na primeira publicação das regras do Storage, permissão para essa leitura — está no `docs/SETUP.md`.
- **Cor do botão de compra:** o laranja `#F26B1D` com texto branco tem contraste 3:1 (reprova AA para texto normal). Usei texto quase preto (`#14161A`) sobre o laranja (≈ 6:1), no estilo de sinalização de segurança.

## Ambiente de desenvolvimento

- Os emuladores rodam via `scripts/emu.mjs`, que remove variáveis de proxy do ambiente: neste ambiente de desenvolvimento um proxy corporativo interceptava a chamada interna Storage → Firestore do emulador. Em máquina comum não faz diferença.
- `.env.emulators` é versionado de propósito: só contém endereços locais e IDs de projeto `demo-*` (sem nenhum segredo).
