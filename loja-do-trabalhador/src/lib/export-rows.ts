import { centsToInput } from './money';
import { formatDateTime } from './dates';
import { statusLabel, paymentStatusLabel } from './orders';
import { paymentLabel, formatOrderNumber } from './whatsapp';
import { stockOf } from './catalog';
import type { Customer, Order, Product } from './types';

export function ordersToRows(orders: Order[]): Record<string, unknown>[] {
  return orders.map((o) => ({
    numero: formatOrderNumber(o.number),
    data: formatDateTime(o.createdAt),
    origem: o.source,
    status: statusLabel[o.status] ?? o.status,
    pagamento: paymentLabel[o.paymentMethod] ?? o.paymentMethod,
    situacao_pagamento: paymentStatusLabel[o.paymentStatus] ?? o.paymentStatus,
    cliente: o.customer?.name,
    telefone: o.customer?.phone,
    tipo: o.customer?.type,
    empresa: o.customer?.company ?? '',
    recebimento: o.fulfillment,
    bairro: o.address?.neighborhood,
    cidade: o.address?.city,
    itens: (o.items ?? []).map((i) => `${i.quantity}x ${i.name}${i.variantLabel ? ` (${i.variantLabel})` : ''}`).join(' | '),
    subtotal: centsToInput(o.subtotal),
    desconto: centsToInput(o.discount),
    total: centsToInput(o.total),
    na_lixeira: o.deletedAt ? 'sim' : 'não',
    id: o.id,
  }));
}

export function customersToRows(customers: Customer[]): Record<string, unknown>[] {
  return customers.map((c) => ({
    nome: c.name,
    telefone: c.phone,
    tipo: c.type,
    empresa: c.company ?? '',
    emails: (c.emails ?? []).join(' '),
    pedidos: c.ordersCount,
    total_gasto: centsToInput(c.totalSpent),
    ultimo_pedido: formatDateTime(c.lastOrderAt),
    observacoes: c.internalNotes ?? '',
  }));
}

export function productsToRows(products: Product[]): Record<string, unknown>[] {
  return products.map((p) => ({
    nome: p.name,
    slug: p.slug,
    categoria: p.categoryId,
    preco: centsToInput(p.price),
    preco_promocional: p.promoPrice ? centsToInput(p.promoPrice) : '',
    estoque: stockOf(p),
    estoque_minimo: p.minStock,
    variantes: (p.variants ?? []).map((v) => `${v.label}:${v.stock}`).join(' | '),
    ativo: p.active ? 'sim' : 'não',
    destaque: p.featured ? 'sim' : 'não',
    ca: p.ca ?? '',
  }));
}
