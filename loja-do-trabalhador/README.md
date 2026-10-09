# Loja do Trabalhador — Site + Loja Virtual + Painel Administrativo

Site institucional, loja virtual e painel administrativo da **Loja do Trabalhador** (Instagram [@lojadotrabalhador_](https://instagram.com/lojadotrabalhador_)) — padrão “Painel Administrativo + Site + Loja Virtual” da VisionWeb.

- O cliente compra pelo site **sem cadastro**; o pedido cai sozinho no painel (em tempo real), o **estoque baixa sozinho** e o WhatsApp abre com o resumo pronto.
- O dono acompanha **vendido hoje / semana / mês / ano**, recebido e a receber, pelo celular.
- Depoimentos **somente de clientes reais**, com selo “Compra verificada”.

> Slogan: *Entender para melhor atender.*

## Pendências antes de publicar

Tudo abaixo é preenchido **pelo painel** (Configurações / Conteúdo) ou é tarefa do cliente — nada disso foi inventado no código:

| Item | Onde | Situação |
|---|---|---|
| WhatsApp da loja | Painel → Configurações | `TODO_WHATSAPP` |
| Endereço, cidade, UF | Painel → Configurações | `TODO_ENDERECO`, `TODO_CIDADE`, `TODO_UF` |
| Horário de funcionamento | Painel → Configurações | `TODO_HORARIO` |
| Chave Pix, nome e cidade do recebedor | Painel → Configurações | `TODO_CHAVE_PIX`… |
| Áreas de frete grátis | Painel → Configurações | `TODO_AREAS_FRETE_GRATIS` |
| E-mail da loja | Painel → Configurações | `TODO_EMAIL` |
| Link do Google Maps e do Google Reviews | Painel → Configurações | vazio |
| **Logo** | `public/images/logo.svg` (ou `.png`) + trocar `hasLogo` para `true` em `src/layouts/Base.astro` | hoje usa wordmark em texto |
| Cor azul exata do logo | `src/styles/tokens.css` (`--blue`) | aproximada `#1C6FB5` |
| **Fotos reais dos produtos** | Painel → Produtos → Fotos | placeholders ilustrativos |
| **Número do CA** de cada EPI/calçado | Painel → Produtos → “Nº do CA” | vazio (nunca inventar) |
| Preços e estoques reais | Painel → Produtos | exemplos do briefing |
| **Revisão das políticas** (trocas e privacidade) | Painel → Conteúdo do site → Políticas | texto genérico — revisar com o cliente/advogado |
| Domínio | Netlify | — |
| E-mail e senha do admin | `npm run create-admin` | — |
| IDs de Analytics (opcional) | Painel → Configurações | vazio |

## Como rodar localmente (com emuladores, sem credenciais reais)

Requisitos: **Node 22+** e **Java 21+** (para os emuladores do Firebase).

```bash
npm install
npm run gen:images          # placeholders WebP, imagem Open Graph e ícones (já versionados)

# Terminal 1 — emuladores (Auth, Firestore, Storage)
npm run emulators

# Terminal 2 — dados de exemplo, usuários e site
npm run seed:emu
ADMIN_EMAIL=dono@exemplo.com ADMIN_PASSWORD=senha-local-123 npm run create-admin:emu
ADMIN_EMAIL=vendedor@exemplo.com ADMIN_PASSWORD=senha-local-456 ADMIN_ROLE=vendedor npm run create-admin:emu
npm run seed:demo           # (opcional) 3 depoimentos FICTÍCIOS rotulados, só para ver o layout
npm run dev:emu             # http://127.0.0.1:4321  ·  painel: http://127.0.0.1:4321/admin
```

Para ver os depoimentos de demonstração no site local: `SHOW_DEMO_TESTIMONIALS=true npm run dev:emu`. Em produção eles **nunca** aparecem (filtro no servidor + teste automatizado).

## Scripts

| Script | O que faz |
|---|---|
| `dev` / `dev:emu` | Servidor de desenvolvimento (com `.env` real / com emuladores) |
| `build` | Build de produção (Astro SSR + adaptador Netlify) |
| `check` | `astro check` + `tsc` |
| `lint` | ESLint |
| `test` | Testes unitários (Vitest) |
| `test:rules` | Testes das regras do Firestore/Storage nos emuladores |
| `test:integration` | Funções de servidor (pedido, estoque, cancelar, lixeira, avaliação…) contra o emulador |
| `test:e2e` | Playwright com emuladores: compra, painel, vendedor, depoimentos, layout, acessibilidade |
| `test:all` | Tudo acima em sequência |
| `emulators` | Sobe os emuladores do Firebase |
| `seed` / `seed:emu` | Categorias, configurações (com `TODO_`) e catálogo inicial — idempotente |
| `seed:demo` | Depoimentos de demonstração (só emulador) |
| `create-admin` / `create-admin:emu` | Cria/promove usuário do painel (e-mail e senha por variável de ambiente ou prompt) |
| `export` | Backup completo JSON + CSVs em `backups/` |
| `gen:images` | Gera placeholders dos produtos, imagem OG e ícones |

## Estrutura

```
src/
  lib/            regras de negócio puras e tipos (compartilhados por site, painel e servidor)
  server/         firebase-admin, leitura do site, autenticação, limite de taxa
    handlers/     create-order, cancel/reopen/trash/reset/empty-trash, anonymize, submit-review, submit-lead, catalog
  pages/          páginas do site (Astro SSR) e rotas /api/* (viram Netlify Function)
  pages/admin/    casca estática do painel
  admin/          painel (Preact + SDK web do Firebase) — bundle separado
  client/         JavaScript do site público (carrinho, checkout) — sem SDK do Firebase
  components/, layouts/, styles/, content/
firestore.rules, storage.rules, firebase.json
scripts/          seed, seed-demo, create-admin, export, gen-images, emu.mjs
tests/            unit/, rules/, integration/, e2e/
docs/             SETUP, GUIA-DO-CLIENTE, PEDIR-DEPOIMENTO, DECISOES
```

## Documentação

- [`docs/SETUP.md`](docs/SETUP.md) — passo a passo de Firebase + Netlify.
- [`docs/GUIA-DO-CLIENTE.md`](docs/GUIA-DO-CLIENTE.md) — guia simples para o dono usar o painel.
- [`docs/PEDIR-DEPOIMENTO.md`](docs/PEDIR-DEPOIMENTO.md) — modelos de mensagem para pedir avaliação.
- [`docs/DECISOES.md`](docs/DECISOES.md) — decisões técnicas e motivos.

Site por [VisionWeb](https://instagram.com/visionwebagencia).
