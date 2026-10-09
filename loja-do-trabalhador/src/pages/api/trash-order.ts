import type { APIRoute } from 'astro';
import { handleTrash } from '../../server/handlers/orderAdmin';

export const prerender = false;
export const POST: APIRoute = ({ request }) => handleTrash(request);
