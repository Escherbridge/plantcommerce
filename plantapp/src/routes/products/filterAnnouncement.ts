/** Polite catalogue status, for example "Showing 6 aquaponics items." */
export function catalogueFilterAnnouncement(count: number, categoryName: string): string {
	const name = categoryName.trim().toLowerCase();
	const noun = count === 1 ? 'item' : 'items';
	return `Showing ${count} ${name} ${noun}.`;
}
