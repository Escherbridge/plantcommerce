import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { ConnectAccountSnapshot } from './connectAccountStatus';

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

	static async attachStripeAccount(
		payoutAccountId: string,
		stripeAccountId: string,
		now = new Date()
	): Promise<void> {
		await db
			.update(table.payoutAccount)
			.set({ stripeAccountId, country: 'US', updatedAt: now })
			.where(eq(table.payoutAccount.id, payoutAccountId));
	}

	/** Apply a connected-account snapshot. Unknown accounts are left alone. */
	static async applyAccountSnapshot(
		snapshot: ConnectAccountSnapshot,
		now = new Date()
	): Promise<boolean> {
		const [row] = await db
			.select({ id: table.payoutAccount.id })
			.from(table.payoutAccount)
			.where(eq(table.payoutAccount.stripeAccountId, snapshot.stripeAccountId))
			.limit(1);
		if (!row) return false;
		await db
			.update(table.payoutAccount)
			.set({
				country: snapshot.country,
				transfersActive: snapshot.transfersActive,
				requirementsDue: snapshot.requirementsDue,
				disabledReason: snapshot.disabledReason,
				updatedAt: now
			})
			.where(eq(table.payoutAccount.id, row.id));
		return true;
	}

	static async notePayout(
		stripeAccountId: string,
		status: 'paid' | 'failed',
		now = new Date()
	): Promise<boolean> {
		const [row] = await db
			.select({ id: table.payoutAccount.id })
			.from(table.payoutAccount)
			.where(eq(table.payoutAccount.stripeAccountId, stripeAccountId))
			.limit(1);
		if (!row) return false;
		await db
			.update(table.payoutAccount)
			.set({ lastPayoutStatus: status, lastPayoutAt: now, updatedAt: now })
			.where(eq(table.payoutAccount.id, row.id));
		return true;
	}

	static async noteExternalAccountUpdated(
		stripeAccountId: string,
		now = new Date()
	): Promise<boolean> {
		const [row] = await db
			.select({ id: table.payoutAccount.id })
			.from(table.payoutAccount)
			.where(eq(table.payoutAccount.stripeAccountId, stripeAccountId))
			.limit(1);
		if (!row) return false;
		await db
			.update(table.payoutAccount)
			.set({ externalAccountUpdatedAt: now, updatedAt: now })
			.where(eq(table.payoutAccount.id, row.id));
		return true;
	}
}
