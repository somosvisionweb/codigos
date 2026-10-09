import type { APIRoute } from 'astro';
import { handleCancel } from '../../server/handlers/orderAdmin';

export const prerender = false;
export const POST: APIRoute = ({ request }) => handleCancel(request);
