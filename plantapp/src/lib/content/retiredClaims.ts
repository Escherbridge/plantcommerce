const retiredSpecies = ['tila', 'pia'].join('');
const livePlants = ['live', 'plants'].join(' ');

/** Public FAQ rows that claim Aevani ships live goods. Hidden even if an older database row remains. */
export function isRetiredLiveGoodsFaq(page: {
	slug?: string | null;
	title?: string | null;
	excerpt?: string | null;
	content?: string | null;
	type?: string | null;
}): boolean {
	if (page.type && page.type !== 'faq') return false;
	if (page.slug === 'faq-shipping-live-products') return true;
	const blob = `${page.title ?? ''}\n${page.excerpt ?? ''}\n${page.content ?? ''}`;
	const pattern = new RegExp(`ship ${livePlants}|${livePlants} and fish|${retiredSpecies}`, 'i');
	return pattern.test(blob);
}
