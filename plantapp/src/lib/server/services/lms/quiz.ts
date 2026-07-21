import { count, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

export interface CreateQuizParams {
	courseId: string;
	lessonId?: string;
	moduleId?: string;
	title: string;
	description?: string;
	timeLimit?: number;
	passingScore?: number;
	maxAttempts?: number;
	randomizeQuestions?: boolean;
	questionCount?: number;
	showCorrectAnswers?: boolean;
}

export type UpdateQuizParams = Partial<Omit<CreateQuizParams, 'courseId'>>;

/** Schema-aligned quiz persistence; see `services/lms/AGENTS.md` §Quiz contract. */
export class QuizService {
	static async createQuiz(data: CreateQuizParams) {
		if (!data.lessonId && !data.moduleId) {
			throw new Error('Quiz must be attached to a lesson or module');
		}

		const [quiz] = await db
			.insert(lmsTable.lmsQuiz)
			.values({
				id: randomUUID(),
				courseId: data.courseId,
				lessonId: data.lessonId ?? null,
				moduleId: data.moduleId ?? null,
				title: data.title,
				description: data.description ?? null,
				timeLimit: data.timeLimit ?? null,
				passingScore: data.passingScore ?? 70,
				maxAttempts: data.maxAttempts ?? 3,
				randomizeQuestions: data.randomizeQuestions ?? false,
				questionCount: data.questionCount ?? null,
				showCorrectAnswers: data.showCorrectAnswers ?? true
			})
			.returning();
		return quiz;
	}

	static async updateQuiz(quizId: string, data: UpdateQuizParams) {
		const updates: Partial<typeof lmsTable.lmsQuiz.$inferInsert> = { updatedAt: new Date() };
		if (data.title !== undefined) updates.title = data.title;
		if (data.description !== undefined) updates.description = data.description;
		if (data.lessonId !== undefined) updates.lessonId = data.lessonId;
		if (data.moduleId !== undefined) updates.moduleId = data.moduleId;
		if (data.timeLimit !== undefined) updates.timeLimit = data.timeLimit;
		if (data.passingScore !== undefined) updates.passingScore = data.passingScore;
		if (data.maxAttempts !== undefined) updates.maxAttempts = data.maxAttempts;
		if (data.randomizeQuestions !== undefined) updates.randomizeQuestions = data.randomizeQuestions;
		if (data.questionCount !== undefined) updates.questionCount = data.questionCount;
		if (data.showCorrectAnswers !== undefined) updates.showCorrectAnswers = data.showCorrectAnswers;

		const [updated] = await db
			.update(lmsTable.lmsQuiz)
			.set(updates)
			.where(eq(lmsTable.lmsQuiz.id, quizId))
			.returning();
		if (!updated) throw new Error('Quiz not found');
		return updated;
	}

	static async deleteQuiz(quizId: string) {
		const attempts = await db
			.select({ id: lmsTable.lmsQuizAttempt.id })
			.from(lmsTable.lmsQuizAttempt)
			.where(eq(lmsTable.lmsQuizAttempt.quizId, quizId));

		for (const attempt of attempts) {
			await db
				.delete(lmsTable.lmsQuizAnswer)
				.where(eq(lmsTable.lmsQuizAnswer.attemptId, attempt.id));
		}
		await db.delete(lmsTable.lmsQuizAttempt).where(eq(lmsTable.lmsQuizAttempt.quizId, quizId));
		await db.delete(lmsTable.lmsQuiz).where(eq(lmsTable.lmsQuiz.id, quizId));
	}

	static async getQuizForLesson(lessonId: string) {
		const [quiz] = await db
			.select()
			.from(lmsTable.lmsQuiz)
			.where(eq(lmsTable.lmsQuiz.lessonId, lessonId));
		return quiz || null;
	}

	static async getQuizForModule(moduleId: string) {
		const [quiz] = await db
			.select()
			.from(lmsTable.lmsQuiz)
			.where(eq(lmsTable.lmsQuiz.moduleId, moduleId));
		return quiz || null;
	}

	static async getQuizById(quizId: string) {
		const [quiz] = await db
			.select()
			.from(lmsTable.lmsQuiz)
			.where(eq(lmsTable.lmsQuiz.id, quizId));
		if (!quiz) return null;

		const [result] = await db
			.select({ count: count() })
			.from(lmsTable.lmsQuestion)
			.innerJoin(
				lmsTable.lmsQuestionBank,
				eq(lmsTable.lmsQuestion.bankId, lmsTable.lmsQuestionBank.id)
			)
			.where(eq(lmsTable.lmsQuestionBank.courseId, quiz.courseId));

		return { ...quiz, availableQuestions: result?.count ?? 0 };
	}

	static async validateQuizCompleteness(
		quizId: string
	): Promise<{ valid: boolean; reason?: string }> {
		const quiz = await this.getQuizById(quizId);
		if (!quiz) return { valid: false, reason: 'Quiz not found' };

		const needed = quiz.questionCount ?? quiz.availableQuestions;
		if (needed < 1 || quiz.availableQuestions < 1) {
			return { valid: false, reason: 'Add at least one question to this course before starting the quiz' };
		}
		if (quiz.availableQuestions < needed) {
			return {
				valid: false,
				reason: `Need ${needed} questions but the course has only ${quiz.availableQuestions}`
			};
		}
		return { valid: true };
	}
}

export default QuizService;
