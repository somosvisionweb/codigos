# SETUP — Firebase + Netlify, passo a passo

Guia para colocar o projeto no ar. Siga na ordem. Nenhum segredo vai para o Git: chaves ficam **só** nas variáveis de ambiente do Netlify e no seu `.env` local (que está no `.gitignore`).

---

## 1. Criar o projeto no Firebase

1. Acesse <https://console.firebase.google.com> → **Adicionar projeto**.
2. Nome sugerido: `loja-do-trabalhador`. Anote o **ID do projeto** (ex.: `loja-do-trabalhador-1a2b3`).
3. Google Analytics do Firebase: pode desativar (o site usa GA4 opcional pelas Configurações do painel).
4. Plano: o **Cloud Storage** (fotos) exige o plano **Blaze** (pago por uso) em projetos novos. Para uma loja deste porte o uso fica normalmente dentro da cota gratuita, mas **configure um alerta de orçamento** em *Uso e faturamento → Detalhes e configurações → Alertas de orçamento* (ex.: R$ 20).

## 2. Ativar os serviços

### 2.1 Authentication
1. **Build → Authentication → Começar**.
2. Aba **Método de login** → ative **E-mail/senha** (só a primeira opção; *link por e-mail* fica desligado).
3. Aba **Configurações → Domínios autorizados**: depois do passo 6, adicione o domínio do Netlify (`xxxx.netlify.app`) e o domínio próprio.
4. Não habilite cadastro público em nenhum lugar: os usuários do painel são criados pelo script `create-admin` (passo 5).

### 2.2 Firestore
1. **Build → Firestore Database → Criar banco de dados**.
2. Modo: **produção**. Local: **southamerica-east1 (São Paulo)**. (Não dá para mudar depois.)

### 2.3 Storage
1. **Build → Storage → Começar** → modo produção → mesma região.
2. Anote o nome do bucket (ex.: `loja-do-trabalhador-1a2b3.firebasestorage.app`).

## 3. Publicar as regras de segurança

As regras estão em `firestore.rules` e `storage.rules`. Duas formas:

**Pelo terminal (recomendado):**
```bash
npx firebase login
npx firebase deploy --only firestore:rules,storage --project SEU_ID_DO_PROJETO
```

**Pelo console:** Firestore → aba **Regras** → cole o conteúdo de `firestore.rules` → **Publicar**. Storage → aba **Regras** → cole `storage.rules` → **Publicar**.

> As regras do Storage consultam o Firestore para saber se o usuário é admin. Na primeira publicação, o Firebase pergunta se pode **conceder essa permissão entre serviços** — aceite.

Confira que **nenhuma** regra ficou como `allow read, write: if true`.

## 4. Chaves e configuração

### 4.1 Conta de serviço (servidor — SECRETA)
1. ⚙️ **Configurações do projeto → Contas de serviço → Gerar nova chave privada** → baixa um arquivo `.json`.
2. Desse arquivo você vai usar três campos: `project_id`, `client_email` e `private_key`.
3. **Não** coloque esse arquivo dentro da pasta do projeto, não envie por chat/e-mail. Depois de cadastrar no Netlify (passo 6), guarde em local seguro ou apague.

### 4.2 App da Web (painel — pública por natureza)
1. ⚙️ **Configurações do projeto → Geral → Seus apps → `</>` (Web)** → apelido `painel` → **Registrar** (sem Hosting).
2. Copie os valores do `firebaseConfig`: `apiKey`, `authDomain`, `projectId`, `storageBucket`, `appId`.
   Esses valores **não são segredo** (a segurança está nas regras), mas mesmo assim ficam em variáveis de ambiente.
3. (Opcional) No Google Cloud Console → *APIs e serviços → Credenciais*, restrinja a `apiKey` por **referenciador HTTP** ao seu domínio.

## 5. Popular o banco e criar o primeiro admin

Na sua máquina, dentro de `loja-do-trabalhador/`, crie um arquivo `.env` (copie de `.env.example`) e preencha **só** as variáveis do servidor:

```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=...
```

Depois:
```bash
npm install
npm run seed            # categorias, configurações com TODO_ e os 16 produtos (pode rodar de novo sem duplicar)
npm run create-admin    # pergunta e-mail, senha (mín. 8), nome e papel → escolha "admin"
```

Para criar um vendedor depois: `npm run create-admin` e escolha o papel `vendedor`. Também dá para usar variáveis: `ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_ROLE=vendedor npm run create-admin` (não deixe a senha salva no histórico do terminal; prefira o prompt).

## 6. Configurar o site no Netlify

1. <https://app.netlify.com> → **Add new site → Import an existing project** → GitHub → repositório `codigos`.
2. **Base directory:** `loja-do-trabalhador`
   **Build command:** `npm run build`
   **Publish directory:** `loja-do-trabalhador/dist` (o Netlify mostra relativo à base: `dist`)
   O `netlify.toml` já define isso e o Node 22.
3. **Site configuration → Environment variables** → adicione **todas** abaixo (escopo: *Builds* e *Functions*):

| Variável | Valor | Secreta? |
|---|---|---|
| `FIREBASE_PROJECT_ID` | `project_id` da conta de serviço | não |
| `FIREBASE_CLIENT_EMAIL` | `client_email` da conta de serviço | **sim** |
| `FIREBASE_PRIVATE_KEY` | `private_key` inteira, com `-----BEGIN...` e `\n` | **sim** (marque “Contains secret values”) |
| `FIREBASE_STORAGE_BUCKET` | nome do bucket | não |
| `SITE_URL` | `https://www.seudominio.com.br` (ou o `.netlify.app` até ter domínio) | não |
| `PUBLIC_FIREBASE_API_KEY` | `apiKey` do app web | não |
| `PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` | não |
| `PUBLIC_FIREBASE_PROJECT_ID` | `projectId` | não |
| `PUBLIC_FIREBASE_STORAGE_BUCKET` | `storageBucket` | não |
| `PUBLIC_FIREBASE_APP_ID` | `appId` | não |

**Não** crie no Netlify: `FIRESTORE_EMULATOR_HOST`, `FIREBASE_AUTH_EMULATOR_HOST`, `FIREBASE_STORAGE_EMULATOR_HOST`, `PUBLIC_USE_EMULATORS`, `SHOW_DEMO_TESTIMONIALS`, `ADMIN_PASSWORD`.

4. As variáveis `PUBLIC_*` entram no build do painel: depois de criá-las, rode **Deploys → Trigger deploy → Clear cache and deploy site**.

## 7. Conferir tudo antes de apontar o domínio

Use o endereço `xxxx.netlify.app`:

- [ ] Home abre, categorias e produtos aparecem (vindos do Firestore).
- [ ] `/admin` → login com o admin criado no passo 5 funciona.
- [ ] Painel → **Configurações**: preencha WhatsApp, endereço, cidade, horário, Pix, áreas de frete grátis. Salve.
- [ ] Faça um pedido de teste no site (celular): carrinho → finalizar → aparece “Pedido #0001 recebido” → WhatsApp abre com a mensagem.
- [ ] O pedido aparece no painel na hora; o estoque do produto baixou.
- [ ] Cancele o pedido de teste no painel (estoque volta) e depois exclua.
- [ ] Envie uma foto de produto pelo painel e veja no site (até 1 minuto).
- [ ] `https://xxxx.netlify.app/robots.txt` tem `Disallow: /admin`; `/sitemap.xml` lista os produtos.
- [ ] Pedidos de teste: **Pedidos → Zerar tudo** (baixa backup e manda para a lixeira) → **Lixeira → Esvaziar** (o número dos próximos pedidos continua a sequência).

## 8. Domínio

1. Netlify → **Domain management → Add a domain** → siga as instruções de DNS. O HTTPS é automático.
2. Atualize `SITE_URL` para o domínio final e faça novo deploy.
3. Firebase → Authentication → **Domínios autorizados** → adicione o domínio.
4. (Opcional) Google Search Console: cadastre o domínio e envie `https://SEU_DOMINIO/sitemap.xml`.

## 9. Backups

- Pelo painel: **Auditoria e backup → Baixar backup completo (JSON)**.
- Pelo terminal (com o `.env` do passo 5): `npm run export` → salva em `backups/` (pasta ignorada pelo Git).
- Recomendado: ativar também o backup agendado do Firestore no Google Cloud (*Firestore → Recuperação de desastres*).

## Solução de problemas

| Sintoma | Causa provável |
|---|---|
| Site mostra erro 500 | Variáveis `FIREBASE_*` ausentes ou `FIREBASE_PRIVATE_KEY` sem as quebras `\n` |
| Login do painel diz “sem acesso” | Usuário existe no Auth mas não em `admins/{uid}` → rode `create-admin` de novo |
| Painel não carrega dados | Regras não publicadas, ou variáveis `PUBLIC_*` criadas depois do build (refaça o deploy) |
| Upload de foto falha | Regras do Storage não publicadas ou permissão entre serviços não concedida (passo 3) |
| Alteração no painel demora a aparecer | Normal até ~1 minuto (cache de CDN). |
