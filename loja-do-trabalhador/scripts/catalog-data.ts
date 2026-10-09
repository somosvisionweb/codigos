// Catálogo inicial. Preços e estoques são EXEMPLOS para o dono ajustar pelo painel.
// Nenhum número de CA é preenchido: o dono informa pelo painel.
import type { Category, SiteSettings } from '../src/lib/types';

export const categories: Omit<Category, 'id'>[] = [
  { name: 'Limpeza', slug: 'limpeza', icon: 'spray-can', order: 1, active: true },
  { name: 'EPIs', slug: 'epis', icon: 'hard-hat', order: 2, active: true },
  { name: 'Calçados', slug: 'calcados', icon: 'footprints', order: 3, active: true },
  { name: 'Ferramentas', slug: 'ferramentas', icon: 'wrench', order: 4, active: true },
  { name: 'Automotivo', slug: 'automotivo', icon: 'car', order: 5, active: true },
  { name: 'Kits', slug: 'kits', icon: 'package', order: 6, active: true },
];

export interface SeedProduct {
  name: string;
  slug: string;
  category: string;
  price: number; // reais
  promoPrice?: number;
  stock: number;
  unit: string;
  short: string;
  description: string;
  specs?: [string, string][];
  variantLabel?: string;
  options?: string[];
  variantStocks?: number[];
  featured?: boolean;
  isKit?: boolean;
  minStock?: number;
}

const sizes = ['37', '38', '39', '40', '41', '42', '43', '44'];

export const products: SeedProduct[] = [
  {
    name: 'Desinfetante 5L', slug: 'desinfetante-5l', category: 'limpeza', price: 24.9, stock: 40, unit: 'Galão 5 litros',
    short: 'Desinfetante para pisos, banheiros e áreas comuns. Rende bem diluído.',
    description: 'Desinfetante em galão de 5 litros para limpeza do dia a dia em casas, condomínios, escritórios e comércios. Use conforme as instruções do rótulo, diluído em água, em pisos, banheiros e áreas comuns.',
    specs: [['Volume', '5 litros'], ['Uso', 'Pisos, banheiros e áreas comuns']],
    variantLabel: 'Fragrância', options: ['Lavanda', 'Pinho', 'Floral'], variantStocks: [14, 13, 13], featured: true, minStock: 6,
  },
  {
    name: 'Detergente neutro 5L', slug: 'detergente-neutro-5l', category: 'limpeza', price: 22.9, stock: 30, unit: 'Galão 5 litros',
    short: 'Detergente neutro para louças, superfícies e limpeza geral.',
    description: 'Detergente neutro em galão de 5 litros, prático para copas, cozinhas industriais e limpeza geral de superfícies laváveis.',
    specs: [['Volume', '5 litros']],
  },
  {
    name: 'Kit vassoura + rodo + pá', slug: 'kit-vassoura-rodo-pa', category: 'limpeza', price: 49.9, stock: 15, unit: 'Kit com 3 peças',
    short: 'O básico da limpeza em um kit só: vassoura, rodo e pá.',
    description: 'Kit com vassoura, rodo e pá coletora para a limpeza diária de casas, lojas e áreas comuns.',
    specs: [['Conteúdo', '1 vassoura, 1 rodo, 1 pá']],
  },
  {
    name: 'Saco de lixo 100L (pacote c/ 10)', slug: 'saco-de-lixo-100l', category: 'limpeza', price: 14.9, stock: 80, unit: 'Pacote com 10 unidades',
    short: 'Sacos de 100 litros para lixeiras grandes e áreas comuns.',
    description: 'Pacote com 10 sacos para lixo de 100 litros, indicados para lixeiras grandes, condomínios, obras e comércios.',
    specs: [['Capacidade', '100 litros'], ['Quantidade', '10 unidades']], minStock: 10,
  },
  {
    name: 'Óculos de segurança esportivo antirrisco', slug: 'oculos-de-seguranca-esportivo', category: 'epis', price: 19.9, stock: 60, unit: 'Unidade',
    short: 'Óculos de proteção com lente antirrisco e modelo esportivo.',
    description: 'Óculos de segurança modelo esportivo com lente antirrisco. Escolha a cor da lente conforme o ambiente de trabalho: incolor para ambientes internos, fumê e marrom para áreas externas.',
    specs: [['Lente', 'Antirrisco']],
    variantLabel: 'Lente', options: ['Incolor', 'Fumê', 'Marrom'], variantStocks: [20, 20, 20], featured: true, minStock: 10,
  },
  {
    name: 'Luva pigmentada (par)', slug: 'luva-pigmentada', category: 'epis', price: 6.9, stock: 200, unit: 'Par',
    short: 'Luva de tricô com pigmentos antiderrapantes. Boa pegada no manuseio.',
    description: 'Luva de tricô pigmentada, indicada para manuseio de materiais em obras, depósitos e oficinas, com pontos que melhoram a pegada.',
    variantLabel: 'Tamanho', options: ['P', 'M', 'G'], variantStocks: [60, 80, 60], featured: true, minStock: 20,
  },
  {
    name: 'Capacete de segurança', slug: 'capacete-de-seguranca', category: 'epis', price: 24.9, stock: 40, unit: 'Unidade',
    short: 'Capacete com carneira ajustável para obras e indústrias.',
    description: 'Capacete de segurança com carneira ajustável. Disponível em cores para identificar funções na equipe.',
    variantLabel: 'Cor', options: ['Branco', 'Azul', 'Amarelo'], variantStocks: [14, 13, 13], minStock: 6,
  },
  {
    name: 'Máscara PFF2', slug: 'mascara-pff2', category: 'epis', price: 4.5, stock: 300, unit: 'Unidade',
    short: 'Respirador descartável PFF2 para poeiras e névoas.',
    description: 'Máscara respiradora descartável do tipo PFF2. Siga as orientações do fabricante sobre tempo de uso e troca.',
    minStock: 30,
  },
  {
    name: 'Botina de segurança bico composite', slug: 'botina-bico-composite', category: 'calcados', price: 89.9, stock: 30, unit: 'Par',
    short: 'Botina com biqueira de composite, mais leve que a de aço.',
    description: 'Botina de segurança com biqueira de composite, mais leve que a biqueira de aço. Indicada para obras, indústrias e depósitos.',
    specs: [['Biqueira', 'Composite']],
    variantLabel: 'Número', options: sizes, variantStocks: [3, 4, 4, 5, 5, 4, 3, 2], featured: true, minStock: 6,
  },
  {
    name: 'Bota de PVC cano longo', slug: 'bota-pvc-cano-longo', category: 'calcados', price: 54.9, stock: 25, unit: 'Par',
    short: 'Bota impermeável de PVC para áreas molhadas e limpeza pesada.',
    description: 'Bota de PVC de cano longo, impermeável, para lavagem, limpeza pesada, obras e áreas úmidas.',
    variantLabel: 'Número', options: sizes, variantStocks: [3, 3, 3, 4, 4, 3, 3, 2], minStock: 6,
  },
  {
    name: 'Martelo unha 27 mm', slug: 'martelo-unha-27mm', category: 'ferramentas', price: 29.9, stock: 20, unit: 'Unidade',
    short: 'Martelo de unha para pregar e arrancar pregos.',
    description: 'Martelo de unha 27 mm para serviços gerais de marcenaria, obra e manutenção.',
    specs: [['Cabeça', '27 mm']],
  },
  {
    name: 'Alicate universal 8"', slug: 'alicate-universal-8', category: 'ferramentas', price: 24.9, stock: 25, unit: 'Unidade',
    short: 'Alicate universal de 8 polegadas para manutenção.',
    description: 'Alicate universal de 8 polegadas para cortar, prender e dobrar fios e pequenas peças em manutenção geral.',
    specs: [['Tamanho', '8 polegadas']],
  },
  {
    name: 'Trena 5 m', slug: 'trena-5m', category: 'ferramentas', price: 14.9, stock: 50, unit: 'Unidade',
    short: 'Trena de 5 metros com trava.',
    description: 'Trena de 5 metros para medições do dia a dia na obra e na manutenção.',
    specs: [['Comprimento', '5 metros']],
  },
  {
    name: 'Shampoo automotivo 5L', slug: 'shampoo-automotivo-5l', category: 'automotivo', price: 39.9, stock: 20, unit: 'Galão 5 litros',
    short: 'Shampoo para lavagem de carros, rende bastante diluído.',
    description: 'Shampoo automotivo em galão de 5 litros para lava-rápidos, oficinas e quem lava o carro em casa. Dilua conforme o rótulo.',
    specs: [['Volume', '5 litros']],
  },
  {
    name: 'Limpa pneus 5L', slug: 'limpa-pneus-5l', category: 'automotivo', price: 44.9, stock: 20, unit: 'Galão 5 litros',
    short: 'Produto para limpeza e acabamento de pneus.',
    description: 'Limpa pneus em galão de 5 litros para acabamento na lavagem de veículos.',
    specs: [['Volume', '5 litros']],
  },
  {
    name: 'Kit Obra Segura', slug: 'kit-obra-segura', category: 'kits', price: 56.2, promoPrice: 49.9, stock: 15, unit: 'Kit com 4 itens',
    short: 'Capacete + óculos + luva + máscara PFF2 em um kit pronto para a obra.',
    description: 'Kit pronto com os EPIs básicos para começar o serviço: capacete de segurança, óculos de segurança, par de luvas pigmentadas e máscara PFF2. Escolha a cor do capacete e o tamanho da luva.',
    specs: [['Conteúdo', 'Capacete, óculos, luva (par) e máscara PFF2']],
    variantLabel: 'Capacete / Luva',
    options: ['Branco / P', 'Branco / M', 'Branco / G', 'Azul / P', 'Azul / M', 'Azul / G', 'Amarelo / P', 'Amarelo / M', 'Amarelo / G'],
    variantStocks: [1, 3, 1, 1, 3, 1, 1, 3, 1], featured: true, isKit: true, minStock: 4,
  },
];

export const defaultSettings: SiteSettings = {
  name: 'Loja do Trabalhador',
  slogan: 'Entender para melhor atender.',
  whatsapp: 'TODO_WHATSAPP',
  email: 'TODO_EMAIL',
  address: 'TODO_ENDERECO',
  city: 'TODO_CIDADE',
  state: 'TODO_UF',
  hours: 'TODO_HORARIO',
  mapsUrl: '',
  instagram: 'lojadotrabalhador_',
  pixKey: 'TODO_CHAVE_PIX',
  pixReceiverName: 'TODO_NOME_RECEBEDOR',
  pixReceiverCity: 'TODO_CIDADE_PIX',
  freeShippingAreas: ['TODO_AREAS_FRETE_GRATIS'],
  lowStockThreshold: 5,
  announcement: 'Frete grátis para a região local · Atendimento pelo WhatsApp',
  googleReviewUrl: '',
  ga4Id: '',
  metaPixelId: '',
  privacyPolicy: '',
  exchangePolicy: '',
  faq: [],
  maintenanceMode: false,
};
