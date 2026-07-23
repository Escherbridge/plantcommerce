import {
	DEMO_COMMERCE_CONTEXT,
	money,
	type CommerceCategory,
	type CommerceTag,
	type CommerceProduct,
	type ProductSearchInput
} from '$lib/commerce/contracts';
import {
	launchCatalogCandidates,
	launchCatalogCategories
} from '$lib/server/catalogSeed/launchManifest';

function deterministicNumber(seed: string): number {
	let hash = 2166136261;
	for (const character of seed) {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

const categoryBySourceId = new Map(
	launchCatalogCategories.map((category) => [category.sourceId, category])
);

export const demoCategories: readonly CommerceCategory[] = launchCatalogCategories.map(
	(category) => ({
		id: `demo-category:${category.slug}`,
		slug: category.slug,
		name: category.name,
		description: `${category.description} Mock/test catalogue grouping only.`,
		parentSlug: category.parentSourceId
			? (categoryBySourceId.get(category.parentSourceId)?.slug ?? null)
			: null
	})
);

const commerceCategoryBySourceId = new Map(
	launchCatalogCategories.map((category, index) => [category.sourceId, demoCategories[index]])
);

export const demoProducts: readonly CommerceProduct[] = launchCatalogCandidates.map(
	(candidate, index) => {
		const seed = deterministicNumber(candidate.sourceId);
		const category = commerceCategoryBySourceId.get(candidate.categorySourceId);
		if (!category) throw new Error(`Demo candidate ${candidate.sourceId} has no category`);
		return {
			id: `demo-product:${candidate.slug}`,
			slug: candidate.slug,
			name: candidate.name,
			description: `Fictional test listing based on the ${candidate.name} research concept. Product claims, specifications, supplier, price, inventory, fulfillment, and returns are simulated for local interface testing only.`,
			shortDescription: `Mock/test ${candidate.name} listing. Not an offer and not available for purchase.`,
			sku: `TEST-${candidate.sku}`,
			category,
			price: money(1500 + (seed % 28500)),
			comparePrice: null,
			availableQuantity: 3 + (seed % 48),
			inStock: true,
			featured: index % 6 === 0,
			images: [],
			dataClass: DEMO_COMMERCE_CONTEXT.dataClass,
			catalogDataClass: 'mock_test',
			catalogDisclosure: 'Mock/test catalogue data. Not an offer or verified supplier listing.',
			tags: candidate.tags.map((tag) => ({ slug: tag.toLowerCase(), name: tag }))
		};
	}
);

export const demoTags: readonly CommerceTag[] = Array.from(
	new Map(
		demoProducts.flatMap((product) => product.tags ?? []).map((tag) => [tag.slug, tag])
	).values()
).sort((left, right) => left.name.localeCompare(right.name));

const productById = new Map(demoProducts.map((product) => [product.id, product]));

export function getDemoProductById(productId: string): CommerceProduct | null {
	return productById.get(productId) ?? null;
}

export function getDemoProductByRoute(
	categorySlug: string,
	productSlug: string
): CommerceProduct | null {
	return (
		demoProducts.find(
			(product) => product.slug === productSlug && product.category.slug === categorySlug
		) ?? null
	);
}

export function searchDemoProducts(input: ProductSearchInput): CommerceProduct[] {
	const query = input.search?.trim().toLocaleLowerCase();
	let products = demoProducts.filter((product) => {
		if (input.categorySlug && product.category.slug !== input.categorySlug) return false;
		if (input.categoryIds?.length) return false;
		if (input.tag && !product.tags?.some((tag) => tag.slug === input.tag)) return false;
		if (input.featured !== undefined && product.featured !== input.featured) return false;
		if (!query) return true;
		return [
			product.name,
			product.shortDescription,
			product.description,
			product.category.name
		].some((value) => value.toLocaleLowerCase().includes(query));
	});

	const direction = input.sortOrder === 'asc' ? 1 : -1;
	products = [...products].sort((left, right) => {
		if (input.sortBy === 'name') return direction * left.name.localeCompare(right.name);
		if (input.sortBy === 'price') {
			return direction * (left.price.amountMinor - right.price.amountMinor);
		}
		return direction * left.id.localeCompare(right.id);
	});

	const offset = Math.max(0, input.offset ?? 0);
	const limit = Math.min(50, Math.max(1, input.limit ?? 20));
	return products.slice(offset, offset + limit);
}
