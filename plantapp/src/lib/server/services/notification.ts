import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export class NotificationService {
	static async create(userId: string, type: string, title: string, message: string, link?: string) {
		return db
			.insert(table.notification)
			.values({ userId, type: type as table.Notification['type'], title, message, link })
			.returning();
	}

	static async getUnread(userId: string) {
		return db
			.select()
			.from(table.notification)
			.where(and(eq(table.notification.userId, userId), eq(table.notification.isRead, false)))
			.orderBy(desc(table.notification.createdAt))
			.limit(20);
	}

	static async getAll(userId: string, limit = 20, offset = 0) {
		return db
			.select()
			.from(table.notification)
			.where(eq(table.notification.userId, userId))
			.orderBy(desc(table.notification.createdAt))
			.limit(limit)
			.offset(offset);
	}

	static async markRead(id: string, userId: string) {
		return db
			.update(table.notification)
			.set({ isRead: true })
			.where(and(eq(table.notification.id, id), eq(table.notification.userId, userId)));
	}

	static async markAllRead(userId: string) {
		return db
			.update(table.notification)
			.set({ isRead: true })
			.where(and(eq(table.notification.userId, userId), eq(table.notification.isRead, false)));
	}

	static async getUnreadCount(userId: string): Promise<number> {
		const result = await db
			.select()
			.from(table.notification)
			.where(and(eq(table.notification.userId, userId), eq(table.notification.isRead, false)));
		return result.length;
	}
}
