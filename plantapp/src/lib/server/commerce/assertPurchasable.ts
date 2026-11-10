import { inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { comingSoonPurchaseError, productIsPurchasable } from './purchasable';

/** Refuse placeholder products before a checkout draft can reach payment. */
export async function assertProductsPurchasable(productIds: number[]): Promise<void> {
	const uniqueIds = [...new Set(productIds)];
	if (uniqueIds.length === 0) return;

	const rows = await db
		.select({
			id: table.product.id,
			name: table.product.name,
			comingSoon: table.product.comingSoon
		})
		.from(table.product)
		.where(inArray(table.product.id, uniqueIds));
	const byId = new Map(rows.map((row) => [row.id, row]));

	for (const id of uniqueIds) {
		const row = byId.get(id);
		if (!row) {
			throw new Error('A cart product is no longer available');
		}
		if (!productIsPurchasable(row)) {
			throw new Error(comingSoonPurchaseError(row.name));
		}
	}
}
