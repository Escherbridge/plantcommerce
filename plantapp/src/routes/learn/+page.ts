import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	type PublishedPages = Awaited<ReturnType<typeof trpc.content.getPublishedPages.query>>;
	// Load featured content from each category
	let guides: PublishedPages = [];
	let blog: PublishedPages = [];
	let faqs: PublishedPages = [];
	let resources: PublishedPages = [];

	try {
		guides = await trpc.content.getPublishedPages.query({ type: 'guide', limit: 3 });
	} catch (e) {
		console.error('Error loading guides:', e);
	}

	try {
		blog = await trpc.content.getPublishedPages.query({ type: 'blog_post', limit: 3 });
	} catch (e) {
		console.error('Error loading blog:', e);
	}

	try {
		faqs = await trpc.content.getPublishedPages.query({ type: 'faq', limit: 6 });
	} catch (e) {
		console.error('Error loading faqs:', e);
	}

	try {
		resources = await trpc.content.getPublishedPages.query({ type: 'page', limit: 3 });
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
