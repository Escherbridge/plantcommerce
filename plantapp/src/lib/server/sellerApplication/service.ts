import { and, desc, eq, gt } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { EmailService } from '$lib/server/services/email';
import type { SellerApplicationInput } from './intake';

export const SELLER_APPLICATION_LIST_LIMIT = 500;

export type StoredSellerApplication = SellerApplicationInput & { id: number };

export type SellerApplicationRecord = {
	id: number;
	name: string;
	email: string;
	businessName: string;
	websiteOrSocial: string | null;
	offerings: string;
	location: string;
	message: string;
	createdAt: Date;
};

const sellerApplicationColumns = {
	id: table.sellerApplication.id,
	name: table.sellerApplication.name,
	email: table.sellerApplication.email,
	businessName: table.sellerApplication.businessName,
	websiteOrSocial: table.sellerApplication.websiteOrSocial,
	offerings: table.sellerApplication.offerings,
	location: table.sellerApplication.location,
	message: table.sellerApplication.message,
	createdAt: table.sellerApplication.createdAt
};

export class SellerApplicationService {
	static async create(input: SellerApplicationInput): Promise<StoredSellerApplication> {
		const [row] = await db
			.insert(table.sellerApplication)
			.values({
				name: input.name,
				email: input.email,
				businessName: input.businessName,
				websiteOrSocial: input.websiteOrSocial,
				offerings: input.offerings,
				location: input.location,
				message: input.message
			})
			.returning({ id: table.sellerApplication.id });

		const application = { ...input, id: row.id };
		await this.notifyAdmins(application);
		return application;
	}

	/** Newest stored applications, optionally those created after `since`. Capped at 500 rows. */
	static async list(since?: Date): Promise<SellerApplicationRecord[]> {
		const selected = db.select(sellerApplicationColumns).from(table.sellerApplication);
		const scoped = since ? selected.where(gt(table.sellerApplication.createdAt, since)) : selected;
		return scoped
			.orderBy(desc(table.sellerApplication.createdAt))
			.limit(SELLER_APPLICATION_LIST_LIMIT);
	}

	/** Best-effort notice to active admins when account email is already configured. */
	private static async notifyAdmins(application: StoredSellerApplication): Promise<void> {
		if (!EmailService.isConfigured()) return;

		try {
			const admins = await db
				.select({ email: table.user.email })
				.from(table.user)
				.where(and(eq(table.user.role, 'admin'), eq(table.user.isActive, true)))
				.limit(5);

			await Promise.all(
				admins.map((admin) =>
					EmailService.sendSellerApplicationNotice(admin.email, application).catch((error) => {
						console.error('Unable to send seller application notice:', error);
					})
				)
			);
		} catch (error) {
			console.error('Seller application was stored, but the admin notice failed:', error);
		}
	}
}
