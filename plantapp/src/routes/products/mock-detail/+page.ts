import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Redirect mock-detail to the products listing page.
// Product detail is now at /products/[category]/[slug]
export const load: PageLoad = async ({ url }) => {
	const productSlug = url.searchParams.get('product');
	if (productSlug) {
		// Best-effort redirect to the new route
		throw redirect(301, `/products?search=${encodeURIComponent(productSlug)}`);
	}
	throw redirect(301, '/products');
};
