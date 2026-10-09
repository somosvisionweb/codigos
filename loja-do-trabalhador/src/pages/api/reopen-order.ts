import type { APIRoute } from 'astro';
import { handleReopen } from '../../server/handlers/orderAdmin';

export const prerender = false;
export const POST: APIRoute = ({ request }) => handleReopen(request);
