import { and, eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';

export function normalizeSellerDisplayName(value: string): string {
	const name = value.trim().replace(/\s+/g, ' ');
	if (name.length < 1 || name.length > 80) {
		throw new Error('Seller display name must be 1 to 80 characters');
	}
	if (/[\u0000-\u001f]/.test(name)) {
		throw new Error('Seller display name cannot include control characters');
	}
	return name;
}

/** Null stays null: the product is Aevani's and no seller transfer is due. */
export function snapshotSellerId(sellerId: number | null | undefined): number | null {
	return sellerId ?? null;
}

export class SellerService {
	/** Open a seller row for a user who already has the seller role. Does not change the role. */
	static async createForSellerUser(
		tx: any,
		input: { userId: string; displayName: string; now?: Date }
	): Promise<typeof table.seller.$inferSelect> {
		const displayName = normalizeSellerDisplayName(input.displayName);
		const [account] = await tx
			.select({ id: table.user.id, role: table.user.role })
			.from(table.user)
			.where(eq(table.user.id, input.userId))
			.limit(1);
		if (!account || account.role !== 'seller') {
			throw new Error('Only a seller account can own products');
		}

		const [existing] = await tx
			.select()
			.from(table.seller)
			.where(eq(table.seller.userId, input.userId))
			.limit(1);
		if (existing) return existing;

		const now = input.now ?? new Date();
		const [created] = await tx
			.insert(table.seller)
			.values({
				userId: input.userId,
				displayName,
				status: 'active',
				createdAt: now,
				updatedAt: now
			})
			.returning();
		return created;
	}

	/** Point a product at a seller, or clear it so the product stays with Aevani. */
	static async linkProduct(
		tx: any,
		productId: number,
		sellerId: number | null,
		now = new Date()
	): Promise<void> {
		if (sellerId !== null) {
			const [seller] = await tx
				.select({ id: table.seller.id, status: table.seller.status })
				.from(table.seller)
				.where(and(eq(table.seller.id, sellerId), eq(table.seller.status, 'active')))
				.limit(1);
			if (!seller) {
				throw new Error('Products can only be linked to an active seller');
			}
		}

		await tx
			.update(table.product)
			.set({ sellerId, updatedAt: now })
			.where(eq(table.product.id, productId));
	}
}
