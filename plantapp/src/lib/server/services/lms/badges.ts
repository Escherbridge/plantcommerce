import { and, count, desc, eq, gt, isNotNull } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

type BadgeEvent = 'course_completed' | 'quiz_perfect' | 'streak_milestone';
type BadgeTriggerConfig = Record<string, unknown>;

function parseTriggerConfig(value: string | null): BadgeTriggerConfig {
	if (!value) return {};
	try {
		const parsed = JSON.parse(value) as unknown;
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
			? (parsed as BadgeTriggerConfig)
			: {};
	} catch {
		return {};
	}
}

function positiveInteger(value: unknown, fallback: number): number {
	return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback;
}

/** Badge awarding is idempotent and derives quiz ownership through enrollment. */
export class BadgeService {
	static async createBadge(data: {
		name: string;
		description?: string;
		iconFileId?: string;
		triggerType: string;
		triggerConfig?: Record<string, unknown>;
	}) {
		const [badge] = await db
			.insert(lmsTable.lmsBadge)
			.values({
				id: randomUUID(),
				name: data.name,
				description: data.description || null,
				iconFileId: data.iconFileId || null,
				triggerType: data.triggerType,
				triggerConfig: data.triggerConfig ? JSON.stringify(data.triggerConfig) : null
			})
			.returning();
		return badge;
	}

	static async listBadges() {
		return db.select().from(lmsTable.lmsBadge).orderBy(lmsTable.lmsBadge.name);
	}

	static async getLearnerBadges(userId: string) {
		return db
			.select({ badge: lmsTable.lmsBadge, earnedAt: lmsTable.lmsLearnerBadge.earnedAt })
			.from(lmsTable.lmsLearnerBadge)
			.innerJoin(lmsTable.lmsBadge, eq(lmsTable.lmsLearnerBadge.badgeId, lmsTable.lmsBadge.id))
			.where(eq(lmsTable.lmsLearnerBadge.userId, userId))
			.orderBy(desc(lmsTable.lmsLearnerBadge.earnedAt));
	}

	static async awardBadge(userId: string, badgeId: string) {
		const [awarded] = await db
			.insert(lmsTable.lmsLearnerBadge)
			.values({ id: randomUUID(), userId, badgeId, earnedAt: new Date() })
			.onConflictDoNothing()
			.returning();
		if (awarded) return awarded;

		const [existing] = await db
			.select()
			.from(lmsTable.lmsLearnerBadge)
			.where(
				and(
					eq(lmsTable.lmsLearnerBadge.userId, userId),
					eq(lmsTable.lmsLearnerBadge.badgeId, badgeId)
				)
			)
			.limit(1);
		if (!existing) throw new Error('Badge could not be awarded');
		return existing;
	}

	static async checkAndAwardBadges(userId: string, event: BadgeEvent) {
		const badges = await db
			.select()
			.from(lmsTable.lmsBadge)
			.where(eq(lmsTable.lmsBadge.isActive, true));
		const awarded = [];

		for (const badge of badges) {
			if (badge.triggerType !== event) continue;

			const config = parseTriggerConfig(badge.triggerConfig);
			let eligible = false;

			switch (event) {
				case 'course_completed': {
					const [result] = await db
						.select({ count: count() })
						.from(lmsTable.lmsEnrollment)
						.where(
							and(
								eq(lmsTable.lmsEnrollment.userId, userId),
								eq(lmsTable.lmsEnrollment.status, 'completed')
							)
						);
					eligible = (result?.count || 0) >= positiveInteger(config.coursesRequired, 1);
					break;
				}
				case 'quiz_perfect': {
					const [result] = await db
						.select({ count: count() })
						.from(lmsTable.lmsQuizAttempt)
						.innerJoin(
							lmsTable.lmsEnrollment,
							eq(lmsTable.lmsQuizAttempt.enrollmentId, lmsTable.lmsEnrollment.id)
						)
						.where(
							and(
								eq(lmsTable.lmsEnrollment.userId, userId),
								isNotNull(lmsTable.lmsQuizAttempt.submittedAt),
								isNotNull(lmsTable.lmsQuizAttempt.passed),
								isNotNull(lmsTable.lmsQuizAttempt.totalPoints),
								gt(lmsTable.lmsQuizAttempt.totalPoints, 0),
								eq(lmsTable.lmsQuizAttempt.score, lmsTable.lmsQuizAttempt.totalPoints)
							)
						);
					eligible = (result?.count || 0) >= positiveInteger(config.perfectQuizzesRequired, 1);
					break;
				}
				case 'streak_milestone': {
					const { LearnerAnalyticsService } = await import('./learnerAnalytics');
					const streak = await LearnerAnalyticsService.getLearningStreak(userId);
					eligible = streak >= positiveInteger(config.streakDays, 7);
					break;
				}
			}

			if (eligible) awarded.push(await this.awardBadge(userId, badge.id));
		}

		return awarded;
	}
}

export default BadgeService;
