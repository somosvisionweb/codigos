// Tipos de domínio compartilhados entre site (servidor), painel e funções.
// Convenções:
//  - valores monetários em CENTAVOS (inteiros);
//  - datas em epoch milissegundos (number) — ver docs/DECISOES.md.

export type Cents = number;
export type EpochMs = number;

export interface SiteSettings {
  name: string;
  slogan: string;
  whatsapp: string; // 55DDDNUMERO, só dígitos
  email: string;
  address: string;
  city: string;
  state: string;
  hours: string;
  mapsUrl: string;
  instagram: string; // usuário, sem @
  pixKey: string;
  pixReceiverName: string;
  pixReceiverCity: string;
  freeShippingAreas: string[]; // cidades ou bairros
  lowStockThreshold: number; // padrão 5
  announcement: string; // barra de aviso
  googleReviewUrl: string;
  ga4Id: string;
  metaPixelId: string;
  privacyPolicy: string;
  exchangePolicy: string;
  faq: FaqItem[];
  maintenanceMode: boolean;
  updatedAt?: EpochMs;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // nome do ícone (lucide)
  order: number;
  active: boolean;
}

export interface Variant {
  id: string;
  label: string;
  stock: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductImage {
  url: string; // imagem grande (até 1600 px)
  thumb?: string; // miniatura (480 px)
  path?: string; // caminho no Storage (para excluir)
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  specs: ProductSpec[];
  price: Cents;
  promoPrice?: Cents | null;
  unit: string; // unidade/embalagem
  images: ProductImage[];
  placeholder?: string; // imagem padrão em /images/produtos/<slug>.webp
  variantLabel?: string; // ex.: "Fragrância", "Tamanho"
  variants: Variant[];
  stock: number; // usado quando não há variantes
  minStock: number;
  ca?: string | null;
  active: boolean;
  featured: boolean;
  relatedIds: string[];
  isKit: boolean;
  createdAt: EpochMs;
  updatedAt: EpochMs;
  createdBy: string;
}

export type OrderStatus =
  | 'novo'
  | 'confirmado'
  | 'separando'
  | 'saiu_entrega'
  | 'pronto_retirada'
  | 'concluido'
  | 'cancelado';

export type PaymentStatus = 'pendente' | 'pago' | 'reembolsado';
export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';
export type Fulfillment = 'entrega' | 'retirada';
export type CustomerType = 'PF' | 'PJ';
export type OrderSource = 'site' | 'manual';

export interface OrderItem {
  productId: string;
  variantId: string | null;
  name: string;
  variantLabel: string | null;
  unitPrice: Cents;
  quantity: number;
  lineTotal: Cents;
}

export interface OrderCustomer {
  name: string;
  phone: string; // normalizado: 55DDDNUMERO
  type: CustomerType;
  company?: string | null;
  email?: string | null;
}

export interface OrderAddress {
  neighborhood: string;
  city: string;
  street?: string | null;
  complement?: string | null;
}

export interface HistoryEntry {
  at: EpochMs;
  by: string; // uid, "site" ou "sistema"
  byName?: string;
  action: string; // ex.: "criado", "status:confirmado", "pago", "cancelado"
  note?: string;
}

export type ShippingKind = 'gratis' | 'a_combinar' | 'retirada';

export interface Order {
  id: string;
  number: number;
  source: OrderSource;
  items: OrderItem[];
  subtotal: Cents;
  discount: Cents;
  couponCode?: string | null;
  shipping: Cents;
  shippingKind: ShippingKind;
  total: Cents;
  customer: OrderCustomer;
  fulfillment: Fulfillment;
  address: OrderAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  history: HistoryEntry[];
  notes: string; // observações do cliente
  internalNotes?: string;
  stockDeducted: boolean;
  reviewToken: string;
  reviewSubmitted?: boolean;
  deletedAt: EpochMs | null;
  createdAt: EpochMs;
  updatedAt: EpochMs;
  createdBy: string;
}

export interface Customer {
  id: string; // telefone normalizado
  name: string;
  phone: string;
  type: CustomerType;
  company?: string | null;
  emails: string[];
  addresses: OrderAddress[];
  internalNotes: string;
  ordersCount: number;
  totalSpent: Cents;
  lastOrderAt: EpochMs | null;
  lastOrderId: string | null;
  anonymized?: boolean;
  createdAt: EpochMs;
  updatedAt: EpochMs;
}

export type LeadStatus = 'novo' | 'em_contato' | 'ganho' | 'perdido';

export interface Lead {
  id: string;
  name: string;
  company: string;
  segment: string;
  items: string; // itens e quantidades (texto livre)
  phone: string;
  email?: string | null;
  city?: string | null;
  status: LeadStatus;
  notes: string;
  createdAt: EpochMs;
  updatedAt: EpochMs;
}

export type TestimonialSource =
  | 'compra_verificada'
  | 'whatsapp'
  | 'instagram'
  | 'google'
  | 'presencial';
export type TestimonialStatus = 'pendente' | 'aprovado' | 'oculto';

export interface Testimonial {
  id: string;
  name: string; // nome completo informado
  displayName: string; // nome exibido (padrão: primeiro nome + inicial)
  role?: string | null; // segmento/cargo
  text: string;
  rating: number | null; // 1–5
  source: TestimonialSource;
  orderId?: string | null;
  productId?: string | null;
  imageUrl?: string | null; // print/foto
  consent: boolean;
  status: TestimonialStatus;
  featured: boolean;
  order: number;
  demo: boolean;
  createdAt: EpochMs;
  updatedAt: EpochMs;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageDesktop: string;
  imageMobile: string;
  link: string;
  order: number;
  active: boolean;
  startsAt: EpochMs | null;
  endsAt: EpochMs | null;
}

export type CouponType = 'percent' | 'fixed';

export interface Coupon {
  id: string; // = código em maiúsculas
  code: string;
  type: CouponType;
  value: number; // % (1–100) ou centavos
  minOrder: Cents;
  validUntil: EpochMs | null;
  maxUses: number | null;
  uses: number;
  active: boolean;
}

export type AdminRole = 'admin' | 'vendedor';

export interface AdminUser {
  id: string; // uid
  role: AdminRole;
  name: string;
  email: string;
  active: boolean;
}

export interface AuditEntry {
  id: string;
  at: EpochMs;
  by: string;
  byName?: string;
  action: string;
  target: string;
  summary: string;
}

/** Item do carrinho como o navegador guarda (sem preço confiável). */
export interface CartLine {
  productId: string;
  variantId: string | null;
  quantity: number;
}
