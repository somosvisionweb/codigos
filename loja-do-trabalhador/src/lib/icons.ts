// Ícones de traço (Lucide, licença ISC) como strings SVG — só os usados, para manter o bundle pequeno.
import {
  SprayCan, HardHat, Footprints, Wrench, Car, Package, ShieldCheck, Truck, MessageCircle, Building2, Clock, MapPin,
  Phone, Mail, Search, Menu, X, Plus, Minus, Trash2, ShoppingCart, ArrowRight, ChevronLeft, ChevronRight, CircleCheck,
  BadgeCheck, Star, Copy, Printer, Handshake, Info, TriangleAlert, Repeat, AtSign, Store, Factory, UsersRound, Boxes,
  Hammer, House, Briefcase, Sparkles, ShoppingBag,
} from 'lucide-static';

const icons: Record<string, string> = {
  'spray-can': SprayCan, 'hard-hat': HardHat, footprints: Footprints, wrench: Wrench, car: Car, package: Package,
  'shield-check': ShieldCheck, truck: Truck, 'message-circle': MessageCircle, 'building-2': Building2, clock: Clock,
  'map-pin': MapPin, phone: Phone, mail: Mail, search: Search, menu: Menu, x: X, plus: Plus, minus: Minus,
  'trash-2': Trash2, 'shopping-cart': ShoppingCart, 'arrow-right': ArrowRight, 'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight, 'circle-check': CircleCheck, 'badge-check': BadgeCheck, star: Star, copy: Copy,
  printer: Printer, handshake: Handshake, info: Info, 'triangle-alert': TriangleAlert, repeat: Repeat,
  'at-sign': AtSign, store: Store, factory: Factory, 'users-round': UsersRound, boxes: Boxes, hammer: Hammer,
  house: House, briefcase: Briefcase, sparkles: Sparkles, 'shopping-bag': ShoppingBag,
};

export const iconNames = Object.keys(icons);

/** SVG do ícone com classe e aria-hidden (decorativo). Conteúdo é estático e confiável. */
export function iconSvg(name: string, cls = 'icon'): string {
  const svg = icons[name] ?? icons.package;
  return svg
    .replace(/class="[^"]*"/, `class="${cls}" aria-hidden="true" focusable="false"`)
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}
