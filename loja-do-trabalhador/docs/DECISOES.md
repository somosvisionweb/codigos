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

## Arquitetura

- **Funções de servidor como rotas de API do Astro** (`src/pages/api/*`), em vez de arquivos separados em `netlify/functions/`. O adaptador `@astrojs/netlify` empacota o site SSR e essas rotas numa **Netlify Function**, então continuam sendo Functions no Netlify, com `firebase-admin` e `zod`. Vantagens: um processo só no desenvolvimento e nos testes E2E (sem `netlify dev`), e tipos compartilhados. A lógica fica em `src/server/handlers/` com assinatura `Request → Response` (padrão Web), pronta para virar `netlify/functions/*.mts` se um dia for preciso separar.
- **Functions além das listadas no briefing:** `trash-order` (excluir/restaurar — precisa recalcular os totais do cliente) e `anonymize-customer` (LGPD — mexe em vários pedidos). Também `GET /api/catalog` (preços e disponibilidade atuais para o carrinho, sem expor estoque acima do limite).
- **Painel como SPA Preact montada manualmente** (sem “ilhas” do Astro), para não depender de scripts inline e permitir CSP com `script-src 'self'`. Rotas por hash (`#/pedidos/...`). O bundle do painel (com o SDK do Firebase) só é baixado em `/admin`; o site público carrega ~10 KB de JS próprio.
- **CSP no middleware** (`src/middleware.ts`) em vez do `netlify.toml`: o servidor de desenvolvimento do adaptador Netlify aplica os cabeçalhos do `netlify.toml`, e a CSP de produção bloqueava os emuladores locais. No middleware a política de produção é idêntica e estrita; só quando o servidor roda com `FIRESTORE_EMULATOR_HOST` libera `127.0.0.1`. Por isso `/admin` é renderizado no servidor (SSR, sem dados) em vez de estático.
- **Sem cache em memória no servidor**: as páginas públicas usam `Netlify-CDN-Cache-Control: s-maxage=60, stale-while-revalidate=300`; alterações do painel aparecem em ~1 minuto.
- **Gráfico do dashboard em SVG próprio** (barras de série única na cor da marca, com tooltip, foco por teclado e alternativa em tabela), sem biblioteca: evita ~60 KB de dependência para um único gráfico.
- **QR codes** (Pix e Instagram) gerados localmente com a biblioteca `qrcode` (npm). O Pix copia-e-cola é montado conforme o BR Code do Banco Central, com teste do CRC16.
- **Kits** têm estoque próprio (o Kit Obra Segura é um SKU com 15 unidades), não baixam o estoque dos componentes. As opções do kit (cor do capacete × tamanho da luva) viraram 9 variantes combinadas, cada uma com seu estoque.
- **Status do pedido:** o painel permite avançar pelo fluxo normal e também “Mudar para outro status” (para corrigir um clique errado). Cancelar e reabrir são só pelo servidor (mexem em estoque). Venda manual já nasce como “Confirmado”.
- **Vendedor não vê Orçamentos nem Depoimentos** (o briefing lista só produtos, pedidos e clientes).
- **Depoimento de compra verificada sem autorização** (cliente não marcou a caixa): fica guardado como pendente, visível só no painel, e as regras impedem publicá-lo.
- **Link de avaliação** usa um token aleatório de 192 bits por pedido; o depoimento tem ID `order-<id>`, o que garante “uma avaliação por pedido” também no banco.
- **Limite de taxa** em Firestore (`rateLimits/`), janela fixa: 10 pedidos/10 min por IP e 5 por telefone; 5 orçamentos e 10 avaliações por IP. Com emuladores o limite é multiplicado por 50 para não atrapalhar os testes (há teste específico com o limite real).
- **Fuso e semana:** todos os agrupamentos usam `America/Sao_Paulo` com cálculo via `Intl` (não assume -03:00 fixo); semana de segunda a domingo.

## Versões

- Astro 7, Preact 10, Firebase JS 13, firebase-admin 14, Zod 4, Vitest 5, Playwright 1.56 (casa com o Chromium disponível no ambiente). TypeScript fixado em 5.9 (o 7 ainda não é suportado pelo `astro check`).
- O Astro 7 manda o `astro dev` para segundo plano quando detecta um agente de IA; os scripts usam `--ignore-lock` para manter o servidor em primeiro plano (necessário para o Playwright).

## Testes e medições feitas

- Unitários (Vitest), regras de segurança (`@firebase/rules-unit-testing`), integração das funções contra o emulador e E2E (Playwright + emuladores + axe-core) — ver README.
- Lighthouse mobile medido num build de produção local (`LOCAL_NODE=1 astro build`, servidor Node apontando para os emuladores): Home 100/100/100/100; Loja 96/100/100/100; Produto 97/100/100/100; Empresas 99/100/100/100 (Performance/Acessibilidade/Boas práticas/SEO). `/finalizar` tem SEO menor só por estar com `noindex` de propósito. Em produção os números dependem da latência do Firestore e do CDN do Netlify.

## Prioridades

- **P1 entregues:** Pix copia-e-cola + QR com valor; “Repetir último pedido”; produtos relacionados; banners, barra de aviso, FAQ e políticas editáveis; cupons validados no servidor; relatórios (período, por produto, parados, curva ABC) e CSVs; usuários/vendedores (ativar, desativar, papel); auditoria e backup completo.
- **P2 (só arquitetura preparada):** pagamento online — campo `paymentStatus` e ponto de extensão comentado em `src/server/handlers/createOrder.ts`; tema escuro do painel não implementado (tokens de cor centralizados em `src/styles/tokens.css` facilitam).
- **Criação de usuários do painel** continua por script (`create-admin`), como pede o briefing; a tela Usuários só ativa/desativa e muda papel.
- As senhas em `tests/e2e/helpers.ts` (`senha-teste-...`) são de contas que só existem no emulador local, recriadas a cada execução dos testes. Não são credenciais reais.
