/** A product can be purchased only when coming_soon is explicitly false. NULL stays not for sale. */
export function productIsPurchasable(product: { comingSoon?: boolean | null }): boolean {
	return product.comingSoon === false;
}

export function comingSoonPurchaseError(name?: string): string {
	return name
		? `${name} is coming soon and is not available for purchase.`
		: 'This product is coming soon and is not available for purchase.';
}
