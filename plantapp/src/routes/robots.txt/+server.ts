import type { RequestHandler } from '@sveltejs/kit';
import { renderRobotsTxt } from '$lib/config/site';

export const GET: RequestHandler = () => {
	return new Response(renderRobotsTxt(), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=86400'
		}
	});
};
