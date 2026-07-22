import { eq, and, desc, count, sql, asc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';

export interface CreateQuestionParams {
	type:
		| 'multiple_choice'
		| 'multi_select'
		| 'true_false'
		| 'fill_blank'
		| 'matching'
		| 'short_answer'
		| 'essay'
		| 'ordering';
	prompt: string;
	config?: string;
	points?: number;
	sortOrder?: number;
	options?: Array<{ label: string; isCorrect: boolean; sortOrder?: number }>;
}

export class QuestionBankService {
	static async createBank(courseId: string, name: string, description?: string) {
		const id = randomUUID();
		const [bank] = await db
			.insert(lmsTable.lmsQuestionBank)
			.values({ id, courseId, name, description: description || null })
			.returning();
		return bank;
	}

	static async createQuestion(bankId: string, data: CreateQuestionParams) {
		const questionId = randomUUID();
		const [question] = await db
			.insert(lmsTable.lmsQuestion)
			.values({
				id: questionId,
				bankId,
				type: data.type,
				prompt: data.prompt,
				config: data.config || null,
				points: data.points ?? 1,
				sortOrder: data.sortOrder ?? 0
			})
			.returning();

		if (data.options && data.options.length > 0) {
			const optionValues = data.options.map((opt, i) => ({
				id: randomUUID(),
				questionId,
				label: opt.label,
				isCorrect: opt.isCorrect,
				sortOrder: opt.sortOrder ?? i
			}));
			await db.insert(lmsTable.lmsQuestionOption).values(optionValues);
		}

		return question;
	}

	static async updateQuestion(questionId: string, data: Partial<CreateQuestionParams>) {
		const updates: Record<string, any> = { updatedAt: new Date() };
		if (data.type) updates.type = data.type;
		if (data.prompt) updates.prompt = data.prompt;
		if (data.config !== undefined) updates.config = data.config;
		if (data.points !== undefined) updates.points = data.points;
		if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;

		const [updated] = await db
			.update(lmsTable.lmsQuestion)
			.set(updates)
			.where(eq(lmsTable.lmsQuestion.id, questionId))
			.returning();

		if (data.options) {
			await db
				.delete(lmsTable.lmsQuestionOption)
				.where(eq(lmsTable.lmsQuestionOption.questionId, questionId));
			if (data.options.length > 0) {
				await db.insert(lmsTable.lmsQuestionOption).values(
					data.options.map((opt, i) => ({
						id: randomUUID(),
						questionId,
						label: opt.label,
						isCorrect: opt.isCorrect,
						sortOrder: opt.sortOrder ?? i
					}))
				);
			}
		}

		return updated;
	}

	static async deleteQuestion(questionId: string) {
		await db
			.delete(lmsTable.lmsQuestionOption)
			.where(eq(lmsTable.lmsQuestionOption.questionId, questionId));
		await db.delete(lmsTable.lmsQuestion).where(eq(lmsTable.lmsQuestion.id, questionId));
	}

	static async listQuestions(bankId: string, type?: string, page = 1, limit = 50) {
		const offset = (page - 1) * limit;
		const conditions = [eq(lmsTable.lmsQuestion.bankId, bankId)];
		if (type) conditions.push(eq(lmsTable.lmsQuestion.type, type as any));

		const questions = await db
			.select()
			.from(lmsTable.lmsQuestion)
			.where(and(...conditions))
			.orderBy(lmsTable.lmsQuestion.sortOrder)
			.limit(limit)
			.offset(offset);

		const [total] = await db
			.select({ count: count() })
			.from(lmsTable.lmsQuestion)
			.where(and(...conditions));

		return { questions, total: total?.count || 0, page, limit };
	}

	static async getRandomQuestions(
		bankId: string,
		questionCount: number,
		excludeIds: string[] = []
	) {
		return db
			.select()
			.from(lmsTable.lmsQuestion)
			.where(eq(lmsTable.lmsQuestion.bankId, bankId))
			.orderBy(sql`random()`)
			.limit(questionCount);
	}

	static async getQuestionsForCourse(courseId: string) {
		const rows = await db
			.select({ question: lmsTable.lmsQuestion })
			.from(lmsTable.lmsQuestion)
			.innerJoin(
				lmsTable.lmsQuestionBank,
				eq(lmsTable.lmsQuestion.bankId, lmsTable.lmsQuestionBank.id)
			)
			.where(eq(lmsTable.lmsQuestionBank.courseId, courseId))
			.orderBy(asc(lmsTable.lmsQuestionBank.name), asc(lmsTable.lmsQuestion.sortOrder));
		return rows.map(({ question }) => question);
	}

	static async getQuestionWithOptions(questionId: string) {
		const [question] = await db
			.select()
			.from(lmsTable.lmsQuestion)
			.where(eq(lmsTable.lmsQuestion.id, questionId));
		if (!question) return null;

		const options = await db
			.select()
			.from(lmsTable.lmsQuestionOption)
			.where(eq(lmsTable.lmsQuestionOption.questionId, questionId))
			.orderBy(lmsTable.lmsQuestionOption.sortOrder);

		return { ...question, options };
	}

	static async importQuestions(bankId: string, questions: CreateQuestionParams[]) {
		const results = [];
		for (const q of questions) {
			const created = await this.createQuestion(bankId, q);
			results.push(created);
		}
		return results;
	}
}

export default QuestionBankService;
