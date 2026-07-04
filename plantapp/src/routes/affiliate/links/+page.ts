import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { redirect, isRedirect } from '@sveltejs/kit';

export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	try {
		const affiliate = await trpc.affiliate.getMyAffiliate.query();

		if (!affiliate) {
			throw redirect(303, '/affiliate/join');
		}

		// Get all active products for link generation
		let products: Array<{
			id: number;
			name: string;
			slug: string;
			price: string;
			categoryName: string;
		}> = [];
		try {
			const results = await trpc.products.getProducts.query({ limit: 50, sortBy: 'name', sortOrder: 'asc' });
			products = (Array.isArray(results) ? results : []).map((row: any) => {
				const p = row.product ?? row;
				const cat = row.category ?? p.category;
				return {
					id: p.id,
					name: p.name,
					slug: p.slug,
					price: p.price,
					categoryName: cat?.name || 'Uncategorized'
				};
			});
		} catch (e) {
			console.error('Error loading products:', e);
		}

		// Get existing affiliate links
		let links: any[] = [];
		try {
			links = await trpc.affiliate.getMyLinks.query();
		} catch (e) {
			console.error('Error loading links:', e);
		}

		return {
			affiliate,
			products,
			links: links || []
		};
	} catch (error) {
		if (isRedirect(error)) throw error;
		console.error('Error loading links page:', error);
		throw redirect(303, '/affiliate/join');
	}
};
