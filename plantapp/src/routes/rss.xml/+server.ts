import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	throw redirect(301, '/feed.xml');
};
