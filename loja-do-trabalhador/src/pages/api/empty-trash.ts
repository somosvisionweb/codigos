import type { APIRoute } from 'astro';
import { handleEmptyTrash } from '../../server/handlers/orderAdmin';

export const prerender = false;
export const POST: APIRoute = ({ request }) => handleEmptyTrash(request);
