# Loja do Trabalhador — site + painel (versão simples)

Dois arquivos principais:

- **`index.html`** — o site: categorias, destaques, kits, todos os produtos com busca e filtro, carrinho, pedido com WhatsApp, orçamento para empresas, perguntas frequentes e contato.
- **`admin.html`** — o painel: resumo de vendas (hoje, semana, mês, ano), pedidos em tempo real (confirmar baixa o estoque, cancelar devolve), produtos (preço, promoção, estoque, foto, opções), configurações (WhatsApp, endereço, frete grátis).

Arquivos de apoio (não apague): `config.js` (você preenche), `dados.js`, `comum.js`, `firebase.js`, `estilo.css`, `firestore.rules`, pastas `img/` e `fontes/`.

**Não precisa de plano pago, de terminal nem de chave secreta.** As fotos ficam no próprio banco (Firestore), então não é preciso ativar o Storage.

---

## Passo a passo

### 1. Criar o projeto no Firebase
1. Acesse **console.firebase.google.com** → **Criar um projeto** → nome `loja-do-trabalhador` → desligue o Google Analytics → **Criar projeto**.

### 2. Ativar o login (Authentication)
1. Menu **Criação → Authentication → Vamos começar**.
2. Aba **Método de login** → **E-mail/senha** → ative só a primeira chave → **Salvar**.
3. Aba **Usuários → Adicionar usuário** → coloque o **seu e-mail** e uma **senha** (mín. 8 caracteres) → **Adicionar usuário**.
4. Na lista, copie o **UID do usuário** (código tipo `z1YtQBFyiSxlWm...`). Você vai usar no passo 4.

### 3. Criar o banco (Firestore)
1. Menu **Criação → Firestore Database → Criar banco de dados**.
2. Local: **southamerica-east1 (São Paulo)** → **modo de produção** → **Criar**.
3. Aba **Regras** → apague tudo → cole todo o conteúdo do arquivo **`firestore.rules`** → **Publicar**.

### 4. Liberar o seu acesso ao painel
Ainda no Firestore, aba **Dados**:
1. **+ Iniciar coleção** → ID da coleção: `admins` → **Próxima**.
2. **ID do documento**: cole o **UID** copiado no passo 2.
3. Campo: `ativo` · Tipo: **boolean** · Valor: **true** → **Salvar**.

> Para dar acesso a outra pessoa (ex.: vendedor), repita o passo 2.3 e este passo 4 com o UID dela. Para tirar o acesso, mude `ativo` para `false`.

### 5. Ligar o site ao Firebase (`config.js`)
1. ⚙️ **Configurações do projeto → Geral → Seus apps → ícone `</>`** → apelido `site` → **Registrar app** (sem Hosting).
2. Aparece um bloco `firebaseConfig`. Abra o arquivo **`config.js`** (no Bloco de Notas) e copie os 4 valores:
   ```js
   export const firebaseConfig = {
     apiKey: 'AIza...',
     authDomain: 'loja-do-trabalhador-xxxx.firebaseapp.com',
     projectId: 'loja-do-trabalhador-xxxx',
     appId: '1:123...:web:abc...',
   };
   ```
   Esses valores **não são segredo** — a proteção está nas regras do passo 3.
3. Salve o arquivo.

### 6. Publicar no Netlify
1. Entre em **app.netlify.com** → **Add new site → Deploy manually**.
2. **Arraste a pasta `loja-simples` inteira** para a área indicada. Pronto, o site sai com um endereço `xxxx.netlify.app`.
3. Para atualizar depois: **Deploys → arraste a pasta de novo**.

### 7. Autorizar o endereço do site no Firebase
Firebase → **Authentication → Configurações → Domínios autorizados → Adicionar domínio** → coloque `xxxx.netlify.app` (e depois o seu domínio próprio, se tiver). Sem isso o login do painel não funciona.

### 8. Primeiro acesso ao painel
1. Abra **`xxxx.netlify.app/admin.html`** e entre com o e-mail e a senha do passo 2.
2. Aba **Início** → **Carregar produtos iniciais** (16 produtos com preços e estoques de exemplo).
3. Aba **Configurações** → preencha **WhatsApp**, endereço, cidade, horário e **bairros com frete grátis** → **Salvar**.
4. Aba **Produtos** → ajuste preços, estoques e troque as fotos ilustrativas por fotos reais (quadradas, fundo branco).
5. Teste: faça um pedido pelo celular no site → ele aparece em **Pedidos** na hora.

---

## Como funciona o dia a dia
- **Pedido novo** aparece no painel na hora (a aba do navegador mostra “(1) Novos pedidos”; dá para ligar um aviso sonoro no Início).
- **Confirmar** → baixa o estoque. **Marcar entregue** → conta no faturamento como concluído. **Cancelar** → devolve o estoque se já tinha baixado.
- **Excluir** apaga o pedido e **não devolve estoque** (cancele antes, se não foi entregue).
- Se aparecer o aviso **“preço diferente do cadastro”**, confira o pedido antes de confirmar: o site roda no navegador do cliente e o painel sempre compara com o preço cadastrado.
- **Imprimir** gera um cupom para impressora térmica de 80 mm.
- O painel sai sozinho depois de 30 minutos sem uso.

## Pendências antes de divulgar
- WhatsApp, endereço, horário e bairros de frete grátis (painel → Configurações).
- Fotos reais dos produtos e preços/estoques reais.
- Logo: coloque o arquivo em `img/logo.png` e troque o texto do logo no `index.html` (há um comentário indicando onde).
- Número do CA dos EPIs (campo no produto; só aparece se preenchido).

## Observações técnicas
- O site lê os produtos pela API REST do Firestore (sem carregar o SDK, fica leve). O painel usa o SDK do Firebase já empacotado em `firebase.js` (gerado a partir de `ferramentas/firebase-entrada.js` com esbuild).
- Enquanto o `config.js` estiver vazio, o site mostra o catálogo de exemplo de `dados.js` e os pedidos vão só pelo WhatsApp.
- Esta versão é simplificada: quem confere estoque e preço é o painel (ao confirmar o pedido). A versão completa, com validação no servidor, está na pasta `loja-do-trabalhador/`.

Site por [VisionWeb](https://instagram.com/visionwebagencia).
