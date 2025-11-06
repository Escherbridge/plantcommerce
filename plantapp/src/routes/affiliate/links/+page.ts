import type { PageLoad } from './$types';
import { requireAffiliate } from '$lib/loaders/protected';
import { trpc } from '$lib/trpc/client';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = async (event) => {
	await requireAffiliate(event);

	try {
		const affiliate = await trpc(event).affiliate.getMyAffiliate.query();

		if (!affiliate) {
			throw redirect(303, '/affiliate/join');
		}

		// Get all products for link generation
		let products = [];
		try {
			products = await trpc(event).products.getProducts.query({ limit: 100 });
		} catch (e) {
			console.error('Error loading products:', e);
		}

		// Get existing affiliate links
		let links = [];
		try {
			links = await trpc(event).affiliate.getMyLinks.query();
		} catch (e) {
			console.error('Error loading links:', e);
		}

		return {
			affiliate,
			products: Array.isArray(products) ? products : [],
			links: links || []
		};
	} catch (error) {
		if (error instanceof Response) {
			throw error;
		}
		console.error('Error loading links page:', error);
		throw redirect(303, '/affiliate/join');
	}
};
