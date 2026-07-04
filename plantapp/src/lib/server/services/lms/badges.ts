import { eq, and, desc, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

export class BadgeService {
  static async createBadge(data: { name: string; description?: string; iconFileId?: string; triggerType: string; triggerConfig?: Record<string, any> }) {
    const id = randomUUID();
    const [badge] = await db.insert(lmsTable.lmsBadge).values({
      id, name: data.name, description: data.description || null,
      iconFileId: data.iconFileId || null, triggerType: data.triggerType,
      triggerConfig: data.triggerConfig ? JSON.stringify(data.triggerConfig) : null
    }).returning();
    return badge;
  }

  static async listBadges() {
    return db.select().from(lmsTable.lmsBadge).orderBy(lmsTable.lmsBadge.name);
  }

  static async getLearnerBadges(userId: string) {
    return db.select({ badge: lmsTable.lmsBadge, earnedAt: lmsTable.lmsLearnerBadge.earnedAt })
      .from(lmsTable.lmsLearnerBadge)
      .innerJoin(lmsTable.lmsBadge, eq(lmsTable.lmsLearnerBadge.badgeId, lmsTable.lmsBadge.id))
      .where(eq(lmsTable.lmsLearnerBadge.userId, userId))
      .orderBy(desc(lmsTable.lmsLearnerBadge.earnedAt));
  }

  static async awardBadge(userId: string, badgeId: string) {
    // Check not already awarded
    const [existing] = await db.select().from(lmsTable.lmsLearnerBadge)
      .where(and(eq(lmsTable.lmsLearnerBadge.userId, userId), eq(lmsTable.lmsLearnerBadge.badgeId, badgeId)))
      .limit(1);
    if (existing) return existing;

    const [awarded] = await db.insert(lmsTable.lmsLearnerBadge).values({
      id: randomUUID(), userId, badgeId, earnedAt: new Date()
    }).returning();
    return awarded;
  }

  static async checkAndAwardBadges(userId: string, event: 'course_completed' | 'quiz_perfect' | 'streak_milestone') {
    const badges = await db.select().from(lmsTable.lmsBadge);
    const awarded = [];

    for (const badge of badges) {
      if (badge.triggerType !== event) continue;

      const config = badge.triggerConfig ? JSON.parse(badge.triggerConfig) : {};
      let eligible = false;

      switch (event) {
        case 'course_completed': {
          const [result] = await db.select({ count: count() }).from(lmsTable.lmsEnrollment)
            .where(and(eq(lmsTable.lmsEnrollment.userId, userId), eq(lmsTable.lmsEnrollment.status, 'completed')));
          const threshold = config.coursesRequired || 1;
          eligible = (result?.count || 0) >= threshold;
          break;
        }
        case 'quiz_perfect': {
          const [result] = await db.select({ count: count() }).from(lmsTable.lmsQuizAttempt)
            .where(and(eq(lmsTable.lmsQuizAttempt.userId, userId), eq(lmsTable.lmsQuizAttempt.passed, true)));
          eligible = (result?.count || 0) > 0;
          break;
        }
        case 'streak_milestone': {
          // Import dynamically to avoid circular deps
          const { LearnerAnalyticsService } = await import('./learnerAnalytics');
          const streak = await LearnerAnalyticsService.getLearningStreak(userId);
          eligible = streak >= (config.streakDays || 7);
          break;
        }
      }

      if (eligible) {
        const result = await this.awardBadge(userId, badge.id);
        awarded.push(result);
      }
    }

    return awarded;
  }
}

export default BadgeService;
