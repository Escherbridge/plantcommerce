import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { EmailService } from '$lib/server/services/email';
import type { SellerApplicationInput } from './intake';

export type StoredSellerApplication = SellerApplicationInput & { id: number };

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
