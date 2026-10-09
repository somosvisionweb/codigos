import type { APIRoute } from 'astro';
import { handleCatalog } from '../../server/handlers/public';

export const prerender = false;
export const GET: APIRoute = ({ request }) => handleCatalog(request);
