// Textos padrão. Podem ser editados no painel (Conteúdo do site / Configurações).
// ATENÇÃO: políticas são textos genéricos — revisão do cliente pendente (ver README).
import type { FaqItem, SiteSettings } from '../lib/types';

export const defaultFaq: FaqItem[] = [
  {
    q: 'Vocês têm frete grátis? Para onde?',
    a: 'Sim, frete grátis para a nossa região local. Ao finalizar o pedido, informe seu bairro e cidade: o site mostra na hora se o seu endereço está na área de frete grátis. Fora dela, o frete é combinado pelo WhatsApp.',
  },
  {
    q: 'Quais as formas de pagamento?',
    a: 'Pix, cartão e dinheiro. Você escolhe ao finalizar o pedido e confirmamos tudo com você pelo WhatsApp.',
  },
  {
    q: 'Como funciona o pedido pelo site?',
    a: 'Você monta o carrinho, preenche seus dados e envia. O pedido é registrado na hora com um número e o WhatsApp abre com o resumo pronto para confirmarmos a entrega ou retirada.',
  },
  {
    q: 'Vendem em quantidade para empresas e condomínios?',
    a: 'Sim. Para compras recorrentes ou em quantidade, use a página Empresas e peça um orçamento: entendemos sua necessidade e montamos a melhor proposta.',
  },
  {
    q: 'Posso trocar um produto?',
    a: 'Pode. Fale com a gente pelo WhatsApp informando o número do pedido. As condições estão na página de Políticas.',
  },
];

export const defaultExchangePolicy = `Trocas e devoluções

• Você pode pedir a troca ou devolução de um produto entrando em contato pelo WhatsApp, informando o número do pedido.
• Para compras feitas a distância (site/WhatsApp com entrega), o Código de Defesa do Consumidor garante o direito de arrependimento em até 7 dias corridos a partir do recebimento.
• O produto deve ser devolvido sem sinais de uso, com embalagem e acessórios, salvo em caso de defeito.
• Produtos com defeito seguem a garantia legal. Avaliamos cada caso e combinamos a troca, o conserto ou a devolução do valor.
• EPIs e itens de higiene que tenham sido usados não podem ser trocados por questão de segurança, exceto em caso de defeito.`;

export const defaultPrivacyPolicy = `Privacidade e dados pessoais

• Seu carrinho fica guardado apenas no seu navegador (neste aparelho). Não criamos conta nem pedimos senha para comprar.
• Ao enviar um pedido, guardamos nome, telefone e, quando houver entrega, o endereço — apenas para atender o pedido, entrar em contato e emitir comprovantes. Se você informar empresa ou e-mail, eles são usados para o mesmo fim.
• Não guardamos dados de cartão no site.
• Não vendemos nem compartilhamos seus dados com terceiros para publicidade.
• Se o site usar ferramentas de estatística (como Google Analytics), elas recebem apenas dados de navegação, sem seu nome ou telefone.
• Você pode pedir a qualquer momento a consulta, a correção ou a exclusão dos seus dados pelo WhatsApp ou e-mail da loja.`;

export const defaultSettings: SiteSettings = {
  name: 'Loja do Trabalhador',
  slogan: 'Entender para melhor atender.',
  whatsapp: '',
  email: '',
  address: '',
  city: '',
  state: '',
  hours: '',
  mapsUrl: '',
  instagram: 'lojadotrabalhador_',
  pixKey: '',
  pixReceiverName: '',
  pixReceiverCity: '',
  freeShippingAreas: [],
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

/** Campo preenchido de verdade (não vazio e não placeholder TODO_). */
export function filled(v: string | null | undefined): v is string {
  return Boolean(v && v.trim() && !v.trim().startsWith('TODO'));
}
