import type { PageLoad } from './$types';
import { getMockProducts } from '$lib/utils/mockProducts';

export const load: PageLoad = async () => {
    // Get the first featured product as our mock detail
    const products = getMockProducts({ featured: true, limit: 1 });
    const product = products[0];

    // Get related products
    const relatedProducts = getMockProducts({ featured: true, limit: 4 }).filter(p => p.id !== product.id);

    // Simple SEO data - no database queries
    const seoData = {
        title: `${product.name} | PlantCommerce`,
        description: product.description || `Shop ${product.name} - premium ${product.category} product.`,
        image: product.imageUrl || product.image || '/images/AI-MockAssets/HydroToolProduct-HydroponicGrowTentKit.png',
        type: 'product' as const,
        tags: [product.category]
    };

    return {
        product,
        relatedProducts,
        seo: seoData
    };
};
