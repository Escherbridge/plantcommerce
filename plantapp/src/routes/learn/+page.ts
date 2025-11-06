import type { PageLoad } from './$types';
import { trpc } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	// Load featured content from each category
	let guides = [];
	let blog = [];
	let faqs = [];
	let resources = [];

	try {
		guides = await trpc(event).content.getByType.query({ type: 'guide', limit: 3 });
	} catch (e) {
		console.error('Error loading guides:', e);
	}

	try {
		blog = await trpc(event).content.getByType.query({ type: 'blog', limit: 3 });
	} catch (e) {
		console.error('Error loading blog:', e);
	}

	try {
		faqs = await trpc(event).content.getByType.query({ type: 'faq', limit: 6 });
	} catch (e) {
		console.error('Error loading faqs:', e);
	}

	try {
		resources = await trpc(event).content.getByType.query({ type: 'resource', limit: 3 });
	} catch (e) {
		console.error('Error loading resources:', e);
	}

	return {
		guides: guides || [],
		blog: blog || [],
		faqs: faqs || [],
		resources: resources || []
	};
};
