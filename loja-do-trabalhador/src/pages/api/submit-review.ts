import type { APIRoute } from 'astro';
import { handleSubmitReview } from '../../server/handlers/public';
import { safeIp } from '../../server/astro';

export const prerender = false;
export const POST: APIRoute = (ctx) => handleSubmitReview(ctx.request, safeIp(() => ctx.clientAddress));
