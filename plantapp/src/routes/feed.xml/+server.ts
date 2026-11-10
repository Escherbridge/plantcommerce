import type { RequestHandler } from '@sveltejs/kit';
import { renderFieldNotesFeed } from '$lib/content/writing';

export const GET: RequestHandler = () => {
	return new Response(renderFieldNotesFeed(), {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
