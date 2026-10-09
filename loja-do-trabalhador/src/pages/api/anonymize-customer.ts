import type { APIRoute } from 'astro';
import { handleAnonymize } from '../../server/handlers/orderAdmin';

export const prerender = false;
export const POST: APIRoute = ({ request }) => handleAnonymize(request);
