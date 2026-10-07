# Site CT Brocks

Site de uma página para o CT Brocks (treino funcional/academia). É HTML, CSS e JS puros, sem build: abra o `index.html` no navegador ou suba a pasta inteira em qualquer hospedagem (Netlify, Vercel, Hostinger, GitHub Pages).

## 1. Contatos (um lugar só)

Edite o bloco `CONFIG` no topo de `js/main.js`:

| Campo | Exemplo | Onde aparece |
|---|---|---|
| `whatsapp` | `5511999998888` | Todos os botões de WhatsApp, com mensagem pronta |
| `telefone` | `(11) 99999-8888` | Seção Contato |
| `instagram` | `ct_brocks` | Botões do Instagram |
| `endereco` | `Rua X, 123 - Bairro, Cidade - UF` | Texto, mapa do Google e botão "Como chegar" |
| `funcionamento` | `Seg a Sex 6h–21h · Sáb 8h–12h` | Seção Contato |

## 2. Fotos e vídeos

Salve cada arquivo **com o nome exato** abaixo e recarregue a página. Enquanto um arquivo não existir, o site mostra um espaço reservado com o nome que ele espera.

### `assets/fotos/`

| Arquivo | Onde aparece | Formato ideal |
|---|---|---|
| `hero.jpg` | Fundo do topo (usado se não houver vídeo) | Horizontal, 2400×1350 |
| `sobre-1.jpg` | Seção "O CT", foto grande | Vertical 4:5, 1200×1500 |
| `sobre-2.jpg` | Seção "O CT", foto menor | Quadrada, 800×800 |
| `funcional.jpg`, `hiit.jpg`, `forca.jpg`, `personal.jpg` | Cards de treinos | 1200×1000 |
| `galeria-1.jpg` a `galeria-6.jpg` | Galeria (1 e 5 são largas) | 1600×1200 |
| `reels-1.jpg`, `reels-2.jpg` | Capa dos vídeos da galeria | Vertical 9:16 |
| `coach-1.jpg` a `coach-3.jpg` | Equipe | Vertical 4:5, 1000×1250 |
| `cta.jpg` | Fundo da chamada final | Horizontal, 2400×1350 |
| `logo.png` *(opcional)* | Cabeçalho (veja o comentário no `index.html`) | PNG transparente |

### `assets/videos/`

| Arquivo | Onde aparece | Formato ideal |
|---|---|---|
| `hero.mp4` | Vídeo de fundo do topo, sem som e em loop | Horizontal 1920×1080, 10 a 20 s, até 8 MB |
| `reels-1.mp4`, `reels-2.mp4` | Vídeos da galeria (reels do Instagram servem) | Vertical 1080×1920, até 10 MB |

Dicas:
- Para o site ficar rápido, comprima as fotos (ex.: squoosh.app) para até ~400 KB cada.
- Vídeos em MP4 (H.264). O vídeo do topo não precisa de áudio.
- Use imagens de alunos só com autorização.

## 3. Textos

Horários, valores dos planos, números da faixa de estatísticas, nomes dos coaches e depoimentos estão no `index.html` com conteúdo de exemplo. Procure pelos comentários e troque pelos dados reais.
