import { eq, isNull, desc, count } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

export class GradingService {
	static async getUngradedSubmissions(courseId?: string) {
		const answers = await db
			.select({
				answerId: lmsTable.lmsQuizAnswer.id,
				attemptId: lmsTable.lmsQuizAnswer.attemptId,
				questionId: lmsTable.lmsQuizAnswer.questionId,
				response: lmsTable.lmsQuizAnswer.response,
				questionPrompt: lmsTable.lmsQuestion.prompt,
				questionType: lmsTable.lmsQuestion.type,
				quizTitle: lmsTable.lmsQuiz.title
			})
			.from(lmsTable.lmsQuizAnswer)
			.innerJoin(
				lmsTable.lmsQuestion,
				eq(lmsTable.lmsQuizAnswer.questionId, lmsTable.lmsQuestion.id)
			)
			.innerJoin(
				lmsTable.lmsQuizAttempt,
				eq(lmsTable.lmsQuizAnswer.attemptId, lmsTable.lmsQuizAttempt.id)
			)
			.innerJoin(
				lmsTable.lmsQuiz,
				eq(lmsTable.lmsQuizAttempt.quizId, lmsTable.lmsQuiz.id)
			)
			.where(isNull(lmsTable.lmsQuizAnswer.score))
			.orderBy(desc(lmsTable.lmsQuizAttempt.startedAt));

		return answers;
	}

	static async gradeAnswer(
		answerId: string,
		score: number,
		feedback: string,
		gradedBy: string
	) {
		const [updated] = await db
			.update(lmsTable.lmsQuizAnswer)
			.set({
				score,
				feedback,
				gradedBy,
				gradedAt: new Date()
			})
			.where(eq(lmsTable.lmsQuizAnswer.id, answerId))
			.returning();

		if (!updated) throw new Error('Answer not found');

		await this.recalculateAttemptScore(updated.attemptId);
		return updated;
	}

	static async recalculateAttemptScore(attemptId: string) {
		const answers = await db
			.select()
			.from(lmsTable.lmsQuizAnswer)
			.where(eq(lmsTable.lmsQuizAnswer.attemptId, attemptId));

		const allGraded = answers.every((a) => a.score !== null);
		const totalScore = answers.reduce((sum, a) => sum + (a.score || 0), 0);

		const [attempt] = await db
			.select()
			.from(lmsTable.lmsQuizAttempt)
			.where(eq(lmsTable.lmsQuizAttempt.id, attemptId));

		const quiz = attempt
			? await db
					.select()
					.from(lmsTable.lmsQuiz)
					.where(eq(lmsTable.lmsQuiz.id, attempt.quizId))
			: [];
		const config = quiz[0]?.config ? JSON.parse(quiz[0].config) : {};
		const passingScore = config.passingScore || 70;
		const maxScore = attempt?.maxScore || 0;
		const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

		await db
			.update(lmsTable.lmsQuizAttempt)
			.set({
				score: totalScore,
				passed: scorePercent >= passingScore,
				status: allGraded ? 'completed' : 'needs_grading'
			})
			.where(eq(lmsTable.lmsQuizAttempt.id, attemptId));
	}

	static async getGradingQueue(courseId?: string) {
		const [result] = await db
			.select({ count: count() })
			.from(lmsTable.lmsQuizAnswer)
			.where(isNull(lmsTable.lmsQuizAnswer.score));

		const submissions = await this.getUngradedSubmissions(courseId);
		return { pending: result?.count || 0, submissions };
	}
}

export default GradingService;
