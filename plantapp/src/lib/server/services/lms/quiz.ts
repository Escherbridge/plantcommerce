import { eq, and, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

export interface CreateQuizParams {
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
	showExplanations?: boolean;
	questionBankId?: string;
}

export class QuizService {
	static async createQuiz(data: CreateQuizParams) {
		if (!data.lessonId && !data.moduleId) {
			throw new Error('Quiz must be attached to a lesson or module');
		}
		const id = randomUUID();
		const config = JSON.stringify({
			timeLimit: data.timeLimit || null,
			passingScore: data.passingScore ?? 70,
			maxAttempts: data.maxAttempts || null,
			randomizeQuestions: data.randomizeQuestions ?? false,
			questionCount: data.questionCount || null,
			showCorrectAnswers: data.showCorrectAnswers ?? true,
			showExplanations: data.showExplanations ?? false
		});

		const [quiz] = await db
			.insert(lmsTable.lmsQuiz)
			.values({
				id,
				lessonId: data.lessonId || null,
				moduleId: data.moduleId || null,
				title: data.title,
				description: data.description || null,
				config,
				questionBankId: data.questionBankId || null
			})
			.returning();
		return quiz;
	}

	static async updateQuiz(quizId: string, data: Partial<CreateQuizParams>) {
		const [existing] = await db
			.select()
			.from(lmsTable.lmsQuiz)
			.where(eq(lmsTable.lmsQuiz.id, quizId));
		if (!existing) throw new Error('Quiz not found');

		const existingConfig = existing.config ? JSON.parse(existing.config) : {};
		const updates: Record<string, any> = { updatedAt: new Date() };

		if (data.title) updates.title = data.title;
		if (data.description !== undefined) updates.description = data.description;
		if (data.lessonId !== undefined) updates.lessonId = data.lessonId;
		if (data.moduleId !== undefined) updates.moduleId = data.moduleId;
		if (data.questionBankId !== undefined) updates.questionBankId = data.questionBankId;

		const configUpdates: Record<string, any> = {};
		if (data.timeLimit !== undefined) configUpdates.timeLimit = data.timeLimit;
		if (data.passingScore !== undefined) configUpdates.passingScore = data.passingScore;
		if (data.maxAttempts !== undefined) configUpdates.maxAttempts = data.maxAttempts;
		if (data.randomizeQuestions !== undefined)
			configUpdates.randomizeQuestions = data.randomizeQuestions;
		if (data.questionCount !== undefined) configUpdates.questionCount = data.questionCount;
		if (data.showCorrectAnswers !== undefined)
			configUpdates.showCorrectAnswers = data.showCorrectAnswers;
		if (data.showExplanations !== undefined)
			configUpdates.showExplanations = data.showExplanations;

		if (Object.keys(configUpdates).length > 0) {
			updates.config = JSON.stringify({ ...existingConfig, ...configUpdates });
		}

		const [updated] = await db
			.update(lmsTable.lmsQuiz)
			.set(updates)
			.where(eq(lmsTable.lmsQuiz.id, quizId))
			.returning();
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
		await db
			.delete(lmsTable.lmsQuizAttempt)
			.where(eq(lmsTable.lmsQuizAttempt.quizId, quizId));
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

		let questionCount = 0;
		if (quiz.questionBankId) {
			const [result] = await db
				.select({ count: count() })
				.from(lmsTable.lmsQuestion)
				.where(eq(lmsTable.lmsQuestion.bankId, quiz.questionBankId));
			questionCount = result?.count || 0;
		}

		return { ...quiz, availableQuestions: questionCount };
	}

	static async validateQuizCompleteness(
		quizId: string
	): Promise<{ valid: boolean; reason?: string }> {
		const quiz = await this.getQuizById(quizId);
		if (!quiz) return { valid: false, reason: 'Quiz not found' };
		if (!quiz.questionBankId) return { valid: false, reason: 'No question bank assigned' };

		const config = quiz.config ? JSON.parse(quiz.config) : {};
		const needed = config.questionCount || quiz.availableQuestions;
		if (quiz.availableQuestions < needed) {
			return {
				valid: false,
				reason: `Need ${needed} questions but bank only has ${quiz.availableQuestions}`
			};
		}
		return { valid: true };
	}
}

export default QuizService;
