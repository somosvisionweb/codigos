// Catálogo inicial (preços e estoques são EXEMPLOS — ajuste no painel).
// Usado pelo botão "Carregar produtos iniciais" do painel e pelo site enquanto o Firebase não está configurado.

export const categorias = ['Limpeza', 'EPIs', 'Calçados', 'Ferramentas', 'Automotivo', 'Kits'];

const n = ['37', '38', '39', '40', '41', '42', '43', '44'];
const p = (id, nome, categoria, preco, estoque, unidade, descricao, extra = {}) => ({
  id, nome, categoria, preco, precoPromo: null, estoque, unidade, descricao,
  opcoesNome: '', opcoes: [], foto: `img/produtos/${id}.webp`, ativo: true, destaque: false, ...extra,
});

export const produtosIniciais = [
  p('desinfetante-5l', 'Desinfetante 5L', 'Limpeza', 2490, 40, 'Galão 5 litros', 'Desinfetante para pisos, banheiros e áreas comuns. Use diluído conforme o rótulo.', { opcoesNome: 'Fragrância', opcoes: ['Lavanda', 'Pinho', 'Floral'], destaque: true }),
  p('detergente-neutro-5l', 'Detergente neutro 5L', 'Limpeza', 2290, 30, 'Galão 5 litros', 'Detergente neutro para louças, superfícies e limpeza geral.'),
  p('kit-vassoura-rodo-pa', 'Kit vassoura + rodo + pá', 'Limpeza', 4990, 15, 'Kit com 3 peças', 'Vassoura, rodo e pá coletora para a limpeza do dia a dia.'),
  p('saco-de-lixo-100l', 'Saco de lixo 100L (pacote c/ 10)', 'Limpeza', 1490, 80, 'Pacote com 10', 'Sacos de 100 litros para lixeiras grandes, condomínios e obras.'),
  p('oculos-de-seguranca-esportivo', 'Óculos de segurança esportivo antirrisco', 'EPIs', 1990, 60, 'Unidade', 'Óculos de proteção modelo esportivo com lente antirrisco.', { opcoesNome: 'Lente', opcoes: ['Incolor', 'Fumê', 'Marrom'], destaque: true }),
  p('luva-pigmentada', 'Luva pigmentada (par)', 'EPIs', 690, 200, 'Par', 'Luva de tricô com pontos antiderrapantes, boa pegada no manuseio.', { opcoesNome: 'Tamanho', opcoes: ['P', 'M', 'G'], destaque: true }),
  p('capacete-de-seguranca', 'Capacete de segurança', 'EPIs', 2490, 40, 'Unidade', 'Capacete com carneira ajustável para obras e indústrias.', { opcoesNome: 'Cor', opcoes: ['Branco', 'Azul', 'Amarelo'] }),
  p('mascara-pff2', 'Máscara PFF2', 'EPIs', 450, 300, 'Unidade', 'Respirador descartável PFF2. Siga as orientações do fabricante.'),
  p('botina-bico-composite', 'Botina de segurança bico composite', 'Calçados', 8990, 30, 'Par', 'Botina com biqueira de composite, mais leve que a de aço.', { opcoesNome: 'Número', opcoes: n, destaque: true }),
  p('bota-pvc-cano-longo', 'Bota de PVC cano longo', 'Calçados', 5490, 25, 'Par', 'Bota impermeável para áreas molhadas e limpeza pesada.', { opcoesNome: 'Número', opcoes: n }),
  p('martelo-unha-27mm', 'Martelo unha 27 mm', 'Ferramentas', 2990, 20, 'Unidade', 'Martelo de unha para serviços gerais.'),
  p('alicate-universal-8', 'Alicate universal 8"', 'Ferramentas', 2490, 25, 'Unidade', 'Alicate universal de 8 polegadas para manutenção.'),
  p('trena-5m', 'Trena 5 m', 'Ferramentas', 1490, 50, 'Unidade', 'Trena de 5 metros para o dia a dia na obra.'),
  p('shampoo-automotivo-5l', 'Shampoo automotivo 5L', 'Automotivo', 3990, 20, 'Galão 5 litros', 'Shampoo para lavagem de carros. Dilua conforme o rótulo.'),
  p('limpa-pneus-5l', 'Limpa pneus 5L', 'Automotivo', 4490, 20, 'Galão 5 litros', 'Limpeza e acabamento de pneus.'),
  p('kit-obra-segura', 'Kit Obra Segura', 'Kits', 5620, 15, 'Kit com 4 itens', 'Capacete + óculos + luva + máscara PFF2. Informe a cor do capacete e o tamanho da luva nas observações.', { precoPromo: 4990, destaque: true }),
];

export const configPadrao = {
  whatsapp: '',
  endereco: '',
  cidade: '',
  horario: '',
  instagram: 'lojadotrabalhador_',
  mapsUrl: '',
  areasFrete: [],
  aviso: 'Frete grátis para a região local · Atendimento pelo WhatsApp',
};
