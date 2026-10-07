# Lubella Buffet Infantil · Site institucional

> "Onde a infância vive sua melhor festa."

Site one-page do **Lubella Buffet Infantil** (Londrina/PR), feito em HTML, CSS e JavaScript puros. Não precisa de instalação nem de build: é só abrir ou publicar.

## Estrutura

```
lubella-buffet/
├── index.html        → todo o conteúdo do site (textos, seções, SEO)
├── css/style.css     → visual (cores, fontes, layout)
├── js/main.js        → WhatsApp, menu, carrossel, galeria, FAQ, formulário
├── img/              → imagens (placeholders para trocar)
├── robots.txt
├── sitemap.xml
└── netlify.toml      → configuração de publicação no Netlify
```

## Ver o site no computador

Abra o `index.html` com dois cliques. Para testar igual ao site no ar, rode um servidor local dentro da pasta:

```bash
cd lubella-buffet
python3 -m http.server 8000
# acesse http://localhost:8000
```

---

## 1. Trocar o número do WhatsApp (faça isso primeiro!)

Abra `js/main.js`. Na primeira linha de código está:

```js
const WHATSAPP_NUMBER = '55XXXXXXXXXXX';
```

Troque pelo número com **55 + DDD + número**, só os dígitos. Exemplo: `'5543999998888'`.

Todos os botões do site usam esse número: Orçamento, Agendar visita, "Quero este pacote", formulário e botão flutuante. Não precisa mexer em mais nada.

As mensagens prontas de cada botão ficam no `index.html`, no atributo `data-wa="..."`. Por exemplo:

```html
<a ... data-wa="Olá, Lubella! Gostaria de agendar uma visita para conhecer o espaço.">
```

## 2. Trocar textos

Todos os textos estão no `index.html`, organizados por seção com comentários (`<!-- ===== SOBRE ===== -->`, `<!-- ===== PACOTES ===== -->` etc.).
Procure por **`[EDITAR]`** e **`[CONFIRMAR]`** (Ctrl+F) para achar o que precisa de informação real:

| O que | Onde |
|---|---|
| História do buffet | seção **Sobre** |
| Números (festas realizadas, seguidores) | seção **Sobre**, nos `data-count`. Altere o número do atributo **e** o texto |
| Itens de cada pacote | seção **Pacotes** |
| Respostas do FAQ (capacidade, pagamento etc.) | seção **FAQ** |
| Horário de atendimento | seção **Contato** e no **footer** |
| CEP | seção **Contato**, **footer** e o JSON-LD no `<head>` |
| **Depoimentos** | seção **Depoimentos**. ⚠️ Os atuais são **fictícios**: substitua por depoimentos reais (com autorização dos clientes) |

## 3. Trocar fotos

As imagens em `img/` são placeholders com o nome e o tamanho ideal escritos nelas. O jeito mais fácil é **salvar sua foto com o mesmo nome do arquivo**, por cima do original:

| Arquivo | Uso | Tamanho sugerido |
|---|---|---|
| `hero-festa-infantil.jpg` | fundo do topo (computador) | 1600×1000 |
| `hero-festa-infantil-mobile.jpg` | fundo do topo (celular) | 800×1000 (vertical) |
| `sobre-equipe-lubella.jpg` | seção Sobre | 800×960 |
| `tema-*.jpg` (8 arquivos) | galeria de temas | 640×480 |
| `espaco-*.jpg` | foto ampliada da galeria (lightbox) | 1200×900 |
| `espaco-*-thumb.jpg` | miniatura da galeria | 600×450 |
| `og-image.jpg` | imagem que aparece ao compartilhar o link no WhatsApp | 1200×630 |
| `favicon.svg` / `apple-touch-icon.png` | ícone da aba / atalho no celular | 180×180 (png) |

Dicas:
- Use **JPG ou WebP** com até ~200 KB cada (comprima em [squoosh.app](https://squoosh.app) ou [tinypng.com](https://tinypng.com)), para o site continuar rápido.
- Mantendo a **mesma proporção** (ex.: 4:3), nada se desalinha.
- Se mudar a foto de um tema ou do espaço, atualize também o texto `alt` no `index.html`. Ele descreve a foto para o Google e para leitores de tela.
- Para adicionar um tema, copie um bloco `<li class="tema">…</li>` e troque imagem, `alt` e nome.

## 4. Trocar cores e fontes

No topo do `css/style.css`, dentro de `:root`:

```css
--navy: #1F2A4D;        /* textos e títulos */
--rose: #F9D3DC;        /* rosa suave */
--rose-deep: #B5305F;   /* botões principais */
--sky: #D3EBF8;         /* azul-claro */
--butter: #FFF1C7;      /* amarelo-manteiga */
--lilac: #E6DCF7;       /* lilás pastel */
--lilac-deep: #6B4E9B;  /* rótulos e ícones */
--cream: #FFFBF5;       /* fundo geral */
```

Mude o valor e o site inteiro acompanha. ⚠️ Os tons escuros (`--navy`, `--rose-deep`, `--lilac-deep`) são usados em textos e botões. Se trocá-los, confira o contraste em [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/) (mínimo de 4,5:1) para o texto continuar legível.

As fontes (Fredoka nos títulos e Nunito no corpo) vêm do Google Fonts, pelo link no `<head>` do `index.html`, e são aplicadas nas variáveis `--font-title` e `--font-body`.

## 5. Mapa, Instagram e domínio

- **Mapa:** no `index.html`, procure `maps.google.com/maps?q=`. O endereço vai depois do `q=`. Para usar o pin oficial do Google Meu Negócio, vá ao Google Maps → Compartilhar → Incorporar um mapa e cole o `src` do iframe.
- **Instagram:** os links apontam para `https://www.instagram.com/lubellabuffetinfantil/`.
- **Domínio:** o site usa `https://www.lubellabuffet.com.br/` como endereço provisório. Quando tiver o domínio definitivo, troque-o em `index.html` (canonical, Open Graph e JSON-LD), `robots.txt` e `sitemap.xml`.
- **Geolocalização (JSON-LD):** as coordenadas no `<head>` são aproximadas (centro de Londrina). Para pegar as exatas, clique com o botão direito no pin do Google Maps e copie a latitude e a longitude.

## 6. Publicar no Netlify

**Opção A: arrastar e soltar (mais simples)**
1. Crie uma conta grátis em [app.netlify.com](https://app.netlify.com).
2. Vá em **Sites → Add new site → Deploy manually**.
3. Arraste a pasta **`lubella-buffet`** inteira para a área indicada.
4. Pronto! Para atualizar, arraste a pasta de novo em **Deploys**.

**Opção B: conectado ao GitHub (atualiza sozinho a cada alteração)**
1. No Netlify: **Add new site → Import an existing project → GitHub** e escolha este repositório.
2. Em **Base directory**, preencha `lubella-buffet`. Deixe **Build command** vazio. O **Publish directory** vem do `netlify.toml`.
3. Clique em **Deploy**.

**Domínio próprio:** em **Domain management → Add a domain**, siga as instruções para apontar o DNS. O HTTPS é ativado automaticamente.

### Alternativa: GitHub Pages
Em **Settings → Pages**, publique a partir da branch. Como o site está na subpasta `lubella-buffet/`, o mais simples é colocar o conteúdo dessa pasta num repositório próprio, ou usar o Netlify.

## Depois de publicar

- Cadastre o site no [Google Search Console](https://search.google.com/search-console) e envie o `sitemap.xml`.
- Teste a prévia do link em [opengraph.xyz](https://www.opengraph.xyz) ou mandando o link para você mesmo no WhatsApp.
- Coloque o link do site na bio do Instagram 😉

## Recursos incluídos

- Mobile-first e responsivo; menu hambúrguer no celular
- Botões de WhatsApp com mensagem pronta em todas as seções, além do botão flutuante
- Formulário de orçamento que monta a mensagem e abre o WhatsApp
- Carrossel de depoimentos (setas, bolinhas, teclado, swipe e pausa ao focar)
- Galeria com lightbox (teclado: ← → Esc)
- FAQ em acordeão acessível
- Animações leves ao rolar, desativadas para quem prefere menos movimento (`prefers-reduced-motion`)
- SEO: title e description, Open Graph, JSON-LD `LocalBusiness`/`EventVenue`, sitemap e robots
- Lighthouse (mobile, teste local): Performance 98 · Acessibilidade 100 · Boas práticas 100 · SEO 100
