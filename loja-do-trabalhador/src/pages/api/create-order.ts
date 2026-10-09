import type { APIRoute } from 'astro';
import { handleCreateOrder } from '../../server/handlers/createOrder';
import { safeIp } from '../../server/astro';

export const prerender = false;
export const POST: APIRoute = (ctx) => handleCreateOrder(ctx.request, safeIp(() => ctx.clientAddress));
