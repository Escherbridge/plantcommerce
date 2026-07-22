import { and, desc, eq, isNotNull, isNull } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as lmsTable from '$lib/server/db/lms-schema';

function responseForReview(answer: string): string {
	try {
		const parsed = JSON.parse(answer) as unknown;
		return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
	} catch {
		return answer;
	}
}

/** Manual grading for submitted answers whose automatic correctness is intentionally unknown. */
export class GradingService {
	static async getUngradedSubmissions(courseId?: string) {
		const conditions = courseId
			? and(
					isNull(lmsTable.lmsQuizAnswer.isCorrect),
					isNotNull(lmsTable.lmsQuizAttempt.submittedAt),
					eq(lmsTable.lmsQuiz.courseId, courseId)
				)
			: and(
					isNull(lmsTable.lmsQuizAnswer.isCorrect),
					isNotNull(lmsTable.lmsQuizAttempt.submittedAt)
				);

		const rows = await db
			.select({
				answerId: lmsTable.lmsQuizAnswer.id,
				attemptId: lmsTable.lmsQuizAnswer.attemptId,
				response: lmsTable.lmsQuizAnswer.answer,
				submittedAt: lmsTable.lmsQuizAttempt.submittedAt,
				questionId: lmsTable.lmsQuestion.id,
				questionPrompt: lmsTable.lmsQuestion.prompt,
				questionType: lmsTable.lmsQuestion.type,
				questionPoints: lmsTable.lmsQuestion.points,
				quizId: lmsTable.lmsQuiz.id,
				quizTitle: lmsTable.lmsQuiz.title,
				userId: table.user.id,
				username: table.user.username,
				userEmail: table.user.email,
				userFirstName: table.user.firstName,
				userLastName: table.user.lastName
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
			.innerJoin(lmsTable.lmsQuiz, eq(lmsTable.lmsQuizAttempt.quizId, lmsTable.lmsQuiz.id))
			.innerJoin(
				lmsTable.lmsEnrollment,
				eq(lmsTable.lmsQuizAttempt.enrollmentId, lmsTable.lmsEnrollment.id)
			)
			.innerJoin(table.user, eq(lmsTable.lmsEnrollment.userId, table.user.id))
			.where(conditions)
			.orderBy(desc(lmsTable.lmsQuizAttempt.submittedAt));

		return rows.map((row) => ({
			id: row.answerId,
			answerId: row.answerId,
			attemptId: row.attemptId,
			response: responseForReview(row.response),
			submittedAt: row.submittedAt,
			question: {
				id: row.questionId,
				prompt: row.questionPrompt,
				type: row.questionType,
				points: row.questionPoints
			},
			quiz: { id: row.quizId, title: row.quizTitle },
			user: {
				id: row.userId,
				username: row.username,
				email: row.userEmail,
				firstName: row.userFirstName,
				lastName: row.userLastName
			}
		}));
	}

	static async gradeAnswer(answerId: string, score: number, feedback: string, gradedBy: string) {
		if (!Number.isInteger(score) || score < 0) {
			throw new Error('Score must be a non-negative whole number');
		}

		const [record] = await db
			.select({
				answer: lmsTable.lmsQuizAnswer,
				questionPoints: lmsTable.lmsQuestion.points,
				submittedAt: lmsTable.lmsQuizAttempt.submittedAt
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
			.where(eq(lmsTable.lmsQuizAnswer.id, answerId))
			.limit(1);

		if (!record) throw new Error('Answer not found');
		if (!record.submittedAt) throw new Error('Answer has not been submitted');
		if (record.answer.isCorrect !== null) throw new Error('Answer has already been graded');
		if (score > record.questionPoints) {
			throw new Error(`Score cannot exceed the question maximum of ${record.questionPoints}`);
		}

		const [updated] = await db
			.update(lmsTable.lmsQuizAnswer)
			.set({
				pointsAwarded: score,
				isCorrect: score === record.questionPoints,
				feedback: feedback.trim() || null,
				gradedBy,
				gradedAt: new Date()
			})
			.where(and(eq(lmsTable.lmsQuizAnswer.id, answerId), isNull(lmsTable.lmsQuizAnswer.isCorrect)))
			.returning();

		if (!updated) throw new Error('Answer has already been graded');

		await this.recalculateAttemptScore(updated.attemptId);
		return updated;
	}

	static async recalculateAttemptScore(attemptId: string) {
		return db.transaction(async (tx) => {
			const [attempt] = await tx
				.select({
					id: lmsTable.lmsQuizAttempt.id,
					totalPoints: lmsTable.lmsQuizAttempt.totalPoints,
					submittedAt: lmsTable.lmsQuizAttempt.submittedAt,
					passingScore: lmsTable.lmsQuiz.passingScore
				})
				.from(lmsTable.lmsQuizAttempt)
				.innerJoin(lmsTable.lmsQuiz, eq(lmsTable.lmsQuizAttempt.quizId, lmsTable.lmsQuiz.id))
				.where(eq(lmsTable.lmsQuizAttempt.id, attemptId))
				.for('update');

			if (!attempt) throw new Error('Attempt not found');
			if (!attempt.submittedAt) throw new Error('Attempt has not been submitted');

			const answers = await tx
				.select({
					pointsAwarded: lmsTable.lmsQuizAnswer.pointsAwarded,
					isCorrect: lmsTable.lmsQuizAnswer.isCorrect,
					questionPoints: lmsTable.lmsQuestion.points
				})
				.from(lmsTable.lmsQuizAnswer)
				.innerJoin(
					lmsTable.lmsQuestion,
					eq(lmsTable.lmsQuizAnswer.questionId, lmsTable.lmsQuestion.id)
				)
				.where(eq(lmsTable.lmsQuizAnswer.attemptId, attemptId));

			if (answers.length === 0) throw new Error('Attempt has no answers');

			const totalScore = answers.reduce((sum, answer) => sum + answer.pointsAwarded, 0);
			const totalPoints =
				attempt.totalPoints ?? answers.reduce((sum, answer) => sum + answer.questionPoints, 0);
			const allGraded = answers.every((answer) => answer.isCorrect !== null);
			const scorePercent = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;

			const [updated] = await tx
				.update(lmsTable.lmsQuizAttempt)
				.set({
					score: totalScore,
					totalPoints,
					passed: allGraded ? scorePercent >= attempt.passingScore : null
				})
				.where(eq(lmsTable.lmsQuizAttempt.id, attemptId))
				.returning();

			return updated;
		});
	}

	static async getGradingQueue(courseId?: string) {
		return this.getUngradedSubmissions(courseId);
	}
}

export default GradingService;
