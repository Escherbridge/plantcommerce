import type { PageLoad } from './$types';
import { cornerstoneEssays } from '$lib/content/essays';
import { isRetiredLiveGoodsFaq } from '$lib/content/retiredClaims';
import { createCallerClient } from '$lib/trpc/client';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	type PublishedPages = Awaited<ReturnType<typeof trpc.content.getPublishedPages.query>>;
	// Load featured content from each category
	let guides: PublishedPages = [];
	let faqs: PublishedPages = [];
	let resources: PublishedPages = [];

	try {
		guides = await trpc.content.getPublishedPages.query({ type: 'guide', limit: 3 });
	} catch (e) {
		console.error('Error loading guides:', e);
	}

	try {
		const publishedFaqs = await trpc.content.getPublishedPages.query({ type: 'faq', limit: 6 });
		faqs = (publishedFaqs || []).filter((faq) => !isRetiredLiveGoodsFaq(faq));
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
		blog: cornerstoneEssays.map((essay) => ({
			title: essay.title,
			slug: essay.slug,
			excerpt: essay.excerpt,
			publishedAt: essay.publishedAt
		})),
		faqs: faqs || [],
		resources: resources || []
	};
};
