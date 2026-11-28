import { eq } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';

export type PayoutOwner =
	| { ownerType: 'seller'; sellerId: number }
	| { ownerType: 'affiliate'; affiliateId: number };

/** Local Connect record. Creating it does not call Stripe. */
export class PayoutAccountService {
	static async ensureLocal(
		tx: any,
		owner: PayoutOwner,
		now = new Date()
	): Promise<typeof table.payoutAccount.$inferSelect> {
		const where =
			owner.ownerType === 'seller'
				? eq(table.payoutAccount.sellerId, owner.sellerId)
				: eq(table.payoutAccount.affiliateId, owner.affiliateId);
		const [existing] = await tx.select().from(table.payoutAccount).where(where).limit(1);
		if (existing) return existing;

		const [created] = await tx
			.insert(table.payoutAccount)
			.values({
				id: crypto.randomUUID(),
				ownerType: owner.ownerType,
				sellerId: owner.ownerType === 'seller' ? owner.sellerId : null,
				affiliateId: owner.ownerType === 'affiliate' ? owner.affiliateId : null,
				stripeAccountId: null,
				country: null,
				transfersActive: false,
				requirementsDue: false,
				disabledReason: null,
				createdAt: now,
				updatedAt: now
			})
			.returning();
		return created;
	}
}
