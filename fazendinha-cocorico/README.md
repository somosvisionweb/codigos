# Fazendinha Co-Có-Ri-Có | Buffet Rural – site institucional

Site estático (HTML + CSS + JavaScript puro, sem framework) para a Fazendinha Co-Có-Ri-Có, buffet rural em Cuiabá – MT.
Funciona em qualquer hospedagem: Netlify, Vercel, GitHub Pages ou hospedagem comum (FTP).

> **Status: rascunho.** Todos os trechos que o cliente ainda precisa enviar estão marcados como **[PREENCHER]**
> e aparecem destacados em amarelo listrado no site. Os textos escritos como sugestão aparecem com o selo **REVISAR**.
> As fotos são ilustrações de exemplo com a etiqueta "FOTO DE EXEMPLO".

## Estrutura de pastas

```
fazendinha-cocorico/
├── index.html                 # página principal (one-page com âncoras)
├── day-use.html               # página do Day-Use (domingo)
├── festas.html                # página de Aniversários e Confraternizações (sábado)
├── passeios-escolares.html    # página de Passeios Escolares (seg–sex)
├── 404.html                   # página "não encontrada"
├── css/style.css              # todo o visual (cores e fontes em :root, no topo)
├── js/main.js                 # número do WhatsApp, menu, galeria, animações
├── images/                    # fotos (WebP), imagem de compartilhamento e ícones
├── favicon.svg                # ícone da aba (galinha)
├── site.webmanifest
├── sitemap.xml
└── robots.txt
```

## Como ver o site no computador

Abra o `index.html` com dois cliques no navegador. Para testar como em produção, rode um servidor local
na pasta do site:

```bash
npx serve .          # ou: python3 -m http.server 8080
```

## Configurar o WhatsApp

Em `js/main.js`, no topo:

```js
const WHATSAPP_NUMBER = "556599820746";                       // 55 + DDD + número, só dígitos
const WHATSAPP_FALLBACK = "https://bit.ly/FazendinhaCocorico"; // link usado se o número estiver vazio
```

- Com o número preenchido, cada botão abre o WhatsApp (`wa.me`) **já com a mensagem pronta** daquele botão.
- Se `WHATSAPP_NUMBER` ficar `"[PREENCHER]"` ou vazio, todos os botões usam o link bit.ly (sem mensagem pronta).
- Sem JavaScript, os botões também usam o bit.ly.
- ⚠️ **Confirme o número.** O número informado foi **+55 65 9982-0746**, que tem 8 dígitos depois do DDD.
  Os celulares hoje têm 9 (ex.: 9 9982-0746 → `5565999820746`). Clique no botão publicado e veja se a conversa abre
  no contato certo. Se não abrir, troque pela versão com o 9 extra e atualize também o telefone visível no
  rodapé/contato e o `"telephone"` do JSON-LD nos 4 arquivos `.html`.

As mensagens prontas ficam no atributo `data-wa` de cada botão, por exemplo:

```html
<a class="btn btn-whats" href="https://bit.ly/FazendinhaCocorico"
   data-wa="Olá! Quero informações sobre o Day-Use de domingo.">Quero ir no Day-Use</a>
```

Para mudar uma mensagem, edite o texto de `data-wa`.

## Editar textos

Abra o `.html` em qualquer editor (VS Code, Bloco de Notas, etc.) e procure o texto (Ctrl+F).

- **[PREENCHER]**: procure por `PREENCHER` e troque pelo conteúdo real. Se o trecho estiver dentro de
  `<span class="preencher">…</span>`, pode apagar o `<span>` e deixar só o texto.
- **REVISAR**: os parágrafos da seção "Sobre" têm `<span class="revisar">`. Depois de aprovado o texto, apague o `<span>`.
- **Tirar os destaques amarelos**: quando tudo estiver preenchido, remova `class="modo-rascunho"` da tag
  `<body>` nas 4 páginas.
- **Menu, rodapé e botão flutuante** se repetem nas 4 páginas. Se mudar um, mude nos outros também.
- **FAQ**: cada pergunta é um bloco `<details>`. Troque o texto dentro de `<div class="resposta">`.
  Para incluir uma pergunta nova, copie um bloco `<details>…</details>` inteiro.
- **Depoimentos**: os 3 cards são **exemplos de layout**. Troque pelos depoimentos reais (com autorização) e apague o
  `<span class="selo-exemplo">Exemplo</span>` de cada card, ou apague a seção inteira.

## Trocar as fotos

Todas as fotos ficam em `images/`, em **WebP**. Cada foto tem 3 tamanhos para o celular baixar a menor:

| Arquivo                         | Tamanho sugerido |
|---------------------------------|------------------|
| `nome.webp`                     | 1200 × 900 (4:3) |
| `nome-800.webp`                 | 800 × 600        |
| `nome-480.webp`                 | 480 × 360        |

A foto do topo (`hero-fazendinha-paisagem`) é horizontal: 1920 × 1080, com versões `-1280` e `-800`.

**Jeito mais fácil:** salve as fotos novas **com os mesmos nomes** dos arquivos atuais, substituindo-os. Não precisa mexer no HTML.

Para converter para WebP e redimensionar, use o [Squoosh](https://squoosh.app) (grátis, no navegador): abra a foto,
escolha "WebP", qualidade ~75, ajuste a largura e salve. Em lote, pela linha de comando:

```bash
cwebp -q 75 -resize 1200 0 foto.jpg -o images/galeria-01-animais-da-fazenda.webp
cwebp -q 75 -resize 800 0  foto.jpg -o images/galeria-01-animais-da-fazenda-800.webp
cwebp -q 75 -resize 480 0  foto.jpg -o images/galeria-01-animais-da-fazenda-480.webp
```

Depois de trocar, **atualize o texto `alt`** (e o `data-legenda`, na galeria) descrevendo a foto real e tire o
"(foto de exemplo)". Isso ajuda pessoas com deficiência visual e o Google.

Fotos usadas:

- `hero-fazendinha-paisagem`: fundo do topo de todas as páginas
- `sobre-familia-na-fazendinha`: seção Sobre
- `day-use-domingo-em-familia`, `festa-aniversario-confraternizacao`, `passeio-escolar-criancas-e-animais`: seções de serviço
- `galeria-01` … `galeria-09`: galeria (a primeira aparece maior no computador)
- `og-fazendinha-cocorico.jpg` (1200 × 630, JPG): imagem que aparece quando o link é compartilhado no WhatsApp
- `apple-touch-icon.png` / `icon-512.png`: ícone ao salvar o site na tela inicial do celular

**Logo:** hoje o topo usa uma galinha em SVG. Quando houver logo oficial, salve como `images/logo.svg` (ou `.webp`)
e siga o comentário `[PREENCHER]` dentro do `<a class="brand">` em cada página.

## Cores e fontes

No topo de `css/style.css`, em `:root`:

```css
--verde-campo: #2f7d32;  --amarelo-sol: #f6b81c;  --vermelho-galinha: #c4372b;
--creme: #fdf6e7;        --bege: #f3e6c8;         --madeira: #7a4a24;
--fonte-titulo: "Baloo 2";   --fonte-texto: "Nunito";
```

Os tons foram escolhidos para manter contraste WCAG AA (texto branco sobre verde/vermelho, texto escuro sobre amarelo).
Se trocar, confira o contraste em <https://webaim.org/resources/contrastchecker/>.

## Mapa do Google

Na seção Contato (`index.html`) há um `<iframe>` do Google Maps **comentado**. Quando o endereço puder ser divulgado:

1. No Google Maps, busque o local → **Compartilhar → Incorporar um mapa** → copie o link `src`.
2. Cole no lugar de `https://www.google.com/maps/embed?pb=[PREENCHER]`.
3. Descomente o `<iframe>` (remova `<!--` e `-->`) e apague o bloco `<div class="mapa-aviso">`.
4. Adicione `streetAddress` e `postalCode` no JSON-LD do `index.html` (bloco `"address"`).

## SEO local

- `title` e `meta description` de cada página usam os termos *buffet rural em Cuiabá*, *day use Cuiabá*,
  *passeio escolar Cuiabá* e *festa infantil fazendinha Cuiabá*.
- Open Graph em todas as páginas, para o link aparecer com imagem e descrição no WhatsApp.
- JSON-LD `LocalBusiness` + `EventVenue` no `index.html` e `Service` + `BreadcrumbList` nas páginas de serviço.
  Por enquanto só o horário do Day-Use (domingo, 10h–16h) está em `openingHoursSpecification`. Quando o cliente
  informar os horários de sábado e de seg–sex, acrescente, por exemplo:

  ```json
  { "@type": "OpeningHoursSpecification", "name": "Passeios escolares",
    "dayOfWeek": ["https://schema.org/Monday","https://schema.org/Tuesday","https://schema.org/Wednesday",
                  "https://schema.org/Thursday","https://schema.org/Friday"],
    "opens": "08:00", "closes": "17:00" }
  ```
- **Domínio:** o site usa `https://www.fazendinhacocorico.com.br` como **provisório** em `canonical`, `og:url`,
  `og:image`, JSON-LD, `sitemap.xml` e `robots.txt`. Troque pelo domínio definitivo com "Localizar e substituir"
  em todos os arquivos.
- Depois de publicar: cadastre o site no [Google Search Console](https://search.google.com/search-console), envie
  o `sitemap.xml` e ligue o site ao **Perfil da Empresa no Google** (Google Meu Negócio). É o que mais ajuda no SEO local.
- Para testar: [Rich Results Test](https://search.google.com/test/rich-results) (JSON-LD) e
  [opengraph.xyz](https://www.opengraph.xyz) (prévia do compartilhamento).

## Publicar

Publique a **pasta `fazendinha-cocorico/` inteira** (é ela a raiz do site).

- **Netlify:** em app.netlify.com, arraste a pasta para "Deploy manually". Depois, em *Domain settings*, conecte o domínio.
- **Vercel:** `npx vercel` dentro da pasta, ou importe o repositório e defina *Root Directory* = `fazendinha-cocorico`.
- **GitHub Pages:** publique o conteúdo da pasta na raiz de um repositório (ou use uma Action) e ative
  *Settings → Pages*. O `404.html` é usado automaticamente.
- **Hospedagem comum (cPanel/FTP):** envie o conteúdo da pasta para `public_html/`.

## Acessibilidade e desempenho (já incluído)

- HTML semântico, link "Pular para o conteúdo", foco visível, menu e galeria operáveis pelo teclado
  (Esc fecha, setas ← → navegam nas fotos), `aria-label` nos botões de ícone e `alt` em todas as imagens.
- FAQ em `<details>` nativo, que funciona sem JavaScript.
- As animações respeitam a opção "reduzir movimento" do sistema.
- Imagens WebP com `srcset` e `loading="lazy"`. Sem bibliotecas externas, só as fontes do Google Fonts.
- O dia de hoje (no fuso de Cuiabá) aparece destacado na agenda da semana.

---

## ✅ Lista de [PREENCHER]: o que o cliente precisa enviar

**Contato e dados da empresa**
- [ ] Confirmar o número de WhatsApp: **(65) 9982-0746** ou **(65) 9 9982-0746**
- [ ] Endereço completo (só se quiser exibir: mapa + JSON-LD). Hoje o site diz "Peça nossa localização no WhatsApp"
- [ ] Domínio definitivo do site
- [ ] CNPJ (rodapé). Opcional; pode ser removido
- [ ] Logo oficial (SVG ou PNG em alta resolução)

**Sobre**
- [ ] Revisar/aprovar os 3 parágrafos marcados como REVISAR
- [ ] História da fazendinha: quando e como começou, quem são os donos

**Day-Use (domingo, 10h–16h)**
- [ ] Valor (adulto / criança)
- [ ] O que inclui (itens da lista)
- [ ] Como funciona a reserva e o pagamento
- [ ] Texto complementar: atrações, diferenciais, regras

**Aniversários e Confraternizações (sábado)**
- [ ] Horário
- [ ] Capacidade (nº de convidados)
- [ ] O que inclui / opções de pacote e cardápio
- [ ] Texto complementar

**Passeios Escolares (segunda a sexta)**
- [ ] Horário
- [ ] Faixa etária indicada
- [ ] O que inclui (roteiro, lanche, monitores…)
- [ ] Como funciona o agendamento
- [ ] Texto complementar

**FAQ: respostas para**
- [ ] O que levar no Day-Use? · Crianças pagam? · Pode levar comida e bebida? · Como agendar um passeio escolar? · Qual a capacidade para festas?
- [ ] Página Day-Use: Precisa reservar antes? · E se chover?
- [ ] Página Festas: O buffet (comida) está incluso? · Posso levar decoração e bolo? · Com quanta antecedência reservar? · Fazem eventos de empresa?
- [ ] Página Passeios: Faixa etária? · Quantos alunos por visita? · Lanche incluso? · Como funciona o transporte?

**Depoimentos**
- [ ] 3 depoimentos reais (nome ou iniciais + tipo de serviço), com autorização para publicar

**Fotos** (horizontais, boa luz; ver tamanhos acima)
- [ ] 1 foto panorâmica para o topo
- [ ] 1 foto para "Sobre" (família / ambiente)
- [ ] 1 foto de cada serviço: Day-Use, Festa, Passeio Escolar
- [ ] 9 fotos para a galeria
- [ ] (opcional) imagem de compartilhamento 1200 × 630 com o logo
