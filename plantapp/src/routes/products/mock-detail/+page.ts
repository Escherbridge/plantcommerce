import type { PageLoad } from './$types';
import { getMockProducts } from '$lib/utils/mockProducts';

export const load: PageLoad = async () => {
    // Get the first featured product as our mock detail
    const products = getMockProducts({ featured: true, limit: 1 });
    const product = products[0];

    // Get related products (other featured products)
    const relatedProducts = getMockProducts({ featured: true, limit: 4 }).filter(p => p.id !== product.id);

    return {
        product,
        relatedProducts
    };
};
