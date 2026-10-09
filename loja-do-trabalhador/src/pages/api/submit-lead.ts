import type { APIRoute } from 'astro';
import { handleSubmitLead } from '../../server/handlers/public';
import { safeIp } from '../../server/astro';

export const prerender = false;
export const POST: APIRoute = (ctx) => handleSubmitLead(ctx.request, safeIp(() => ctx.clientAddress));
