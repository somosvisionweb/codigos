import type { APIRoute } from 'astro';
import { handleReset } from '../../server/handlers/orderAdmin';

export const prerender = false;
export const POST: APIRoute = ({ request }) => handleReset(request);
