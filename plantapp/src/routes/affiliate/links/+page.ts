import type { PageLoad } from './$types';
import { createCallerClient } from '$lib/trpc/client';
import { redirect, isRedirect } from '@sveltejs/kit';
import { getUser } from '$lib/loaders/protected';
import { affiliatePortalStatus } from '$lib/affiliate/application';

export interface LinkableProduct {
	id: number;
	name: string;
	categoryName: string;
}

/** Active affiliates can create links. Admins without an account see an empty state. */
export const load: PageLoad = async (event) => {
	const trpc = createCallerClient(event.fetch);
	const user = await getUser(event);
	try {
		const affiliate = await trpc.affiliate.getMyAffiliate.query();
		const status = affiliatePortalStatus(affiliate);
		if (status !== 'active' && user?.role !== 'admin') {
			throw redirect(303, '/affiliate/join');
		}
		if (status !== 'active') {
			return { canCreate: false, products: [] as LinkableProduct[], links: [] };
		}

		let products: LinkableProduct[] = [];
		try {
			const results = await trpc.products.getProducts.query({
				limit: 50,
				sortBy: 'name',
				sortOrder: 'asc'
			});
			products = (Array.isArray(results) ? results : [])
				.map((row) => {
					const record = row as {
						product?: { id?: number; name?: string };
						category?: { name?: string };
						id?: number;
						name?: string;
					};
					const product = record.product ?? record;
					return {
						id: product.id ?? 0,
						name: product.name ?? '',
						categoryName: record.category?.name || 'Catalogue'
					};
				})
				.filter((product) => product.id > 0 && product.name);
		} catch (error) {
			console.error('Error loading products for affiliate links:', error);
		}

		let links: Awaited<ReturnType<typeof trpc.affiliate.getMyLinks.query>> = [];
		try {
			links = await trpc.affiliate.getMyLinks.query();
		} catch (error) {
			console.error('Error loading affiliate links:', error);
		}

		return { canCreate: true, products, links };
	} catch (error) {
		if (isRedirect(error)) throw error;
		console.error('Error loading affiliate links page:', error);
		throw redirect(303, '/affiliate/join');
	}
};
