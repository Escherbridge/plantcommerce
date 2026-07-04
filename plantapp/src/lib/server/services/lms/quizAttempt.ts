import { eq, and, count, desc } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';
import { QuestionBankService } from './questionBank';
import { QuizService } from './quiz';

export class QuizAttemptService {
	static async startAttempt(quizId: string, userId: string) {
		const quiz = await QuizService.getQuizById(quizId);
		if (!quiz) throw new Error('Quiz not found');

		const config = quiz.config ? JSON.parse(quiz.config) : {};

		// Check max attempts
		if (config.maxAttempts) {
			const [existing] = await db
				.select({ count: count() })
				.from(lmsTable.lmsQuizAttempt)
				.where(
					and(
						eq(lmsTable.lmsQuizAttempt.quizId, quizId),
						eq(lmsTable.lmsQuizAttempt.userId, userId)
					)
				);
			if ((existing?.count || 0) >= config.maxAttempts) {
				throw new Error('Maximum attempts reached');
			}
		}

		// Get questions
		let questions: any[] = [];
		if (quiz.questionBankId) {
			const qCount = config.questionCount || quiz.availableQuestions;
			questions = await QuestionBankService.getRandomQuestions(quiz.questionBankId, qCount);
		}

		// Create attempt
		const attemptId = randomUUID();
		const [attempt] = await db
			.insert(lmsTable.lmsQuizAttempt)
			.values({
				id: attemptId,
				quizId,
				userId,
				status: 'in_progress',
				startedAt: new Date(),
				maxScore: questions.reduce((sum: number, q: any) => sum + (q.points || 1), 0)
			})
			.returning();

		// Return questions without correct answers
		const safeQuestions = await Promise.all(
			questions.map(async (q: any) => {
				const options = await db
					.select()
					.from(lmsTable.lmsQuestionOption)
					.where(eq(lmsTable.lmsQuestionOption.questionId, q.id))
					.orderBy(lmsTable.lmsQuestionOption.sortOrder);

				return {
					id: q.id,
					type: q.type,
					prompt: q.prompt,
					points: q.points,
					options: options.map((o) => ({ id: o.id, label: o.label, sortOrder: o.sortOrder }))
				};
			})
		);

		return {
			attemptId: attempt.id,
			timeLimit: config.timeLimit || null,
			questions: config.randomizeQuestions
				? safeQuestions.sort(() => Math.random() - 0.5)
				: safeQuestions
		};
	}

	static async submitAttempt(
		attemptId: string,
		answers: Array<{ questionId: string; response: string | string[] }>
	) {
		const [attempt] = await db
			.select()
			.from(lmsTable.lmsQuizAttempt)
			.where(eq(lmsTable.lmsQuizAttempt.id, attemptId));
		if (!attempt) throw new Error('Attempt not found');
		if (attempt.status !== 'in_progress') throw new Error('Attempt already submitted');

		// Check time limit
		const quiz = await QuizService.getQuizById(attempt.quizId);
		const config = quiz?.config ? JSON.parse(quiz.config) : {};
		if (config.timeLimit && attempt.startedAt) {
			const elapsed = (Date.now() - new Date(attempt.startedAt).getTime()) / 60000;
			if (elapsed > config.timeLimit + 1) {
				throw new Error('Time limit exceeded');
			}
		}

		let totalScore = 0;
		let maxScore = 0;
		let needsManualGrading = false;

		for (const answer of answers) {
			const result = await this.autoGrade(answer.questionId, answer.response);

			const answerId = randomUUID();
			await db.insert(lmsTable.lmsQuizAnswer).values({
				id: answerId,
				attemptId,
				questionId: answer.questionId,
				response:
					typeof answer.response === 'string'
						? answer.response
						: JSON.stringify(answer.response),
				isCorrect: result.isCorrect,
				score: result.score,
				feedback: result.feedback
			});

			if (result.score !== null) totalScore += result.score;
			maxScore += result.maxPoints;
			if (result.needsManualGrading) needsManualGrading = true;
		}

		const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
		const passed = scorePercent >= (config.passingScore || 70);

		await db
			.update(lmsTable.lmsQuizAttempt)
			.set({
				status: needsManualGrading ? 'needs_grading' : 'completed',
				endedAt: new Date(),
				score: totalScore,
				maxScore,
				passed
			})
			.where(eq(lmsTable.lmsQuizAttempt.id, attemptId));

		return { attemptId, score: totalScore, maxScore, scorePercent, passed, needsManualGrading };
	}

	static async autoGrade(
		questionId: string,
		response: string | string[]
	): Promise<{
		isCorrect: boolean | null;
		score: number | null;
		maxPoints: number;
		feedback: string | null;
		needsManualGrading: boolean;
	}> {
		const questionData = await QuestionBankService.getQuestionWithOptions(questionId);
		if (!questionData)
			return {
				isCorrect: null,
				score: 0,
				maxPoints: 0,
				feedback: 'Question not found',
				needsManualGrading: false
			};

		const maxPoints = questionData.points || 1;
		const options = questionData.options || [];

		switch (questionData.type) {
			case 'multiple_choice': {
				const correctOption = options.find((o) => o.isCorrect);
				const isCorrect = correctOption?.id === response;
				return {
					isCorrect,
					score: isCorrect ? maxPoints : 0,
					maxPoints,
					feedback: null,
					needsManualGrading: false
				};
			}
			case 'true_false': {
				const correctOption = options.find((o) => o.isCorrect);
				const isCorrect = correctOption?.id === response;
				return {
					isCorrect,
					score: isCorrect ? maxPoints : 0,
					maxPoints,
					feedback: null,
					needsManualGrading: false
				};
			}
			case 'multi_select': {
				const correctIds = new Set(options.filter((o) => o.isCorrect).map((o) => o.id));
				const selectedIds = new Set(Array.isArray(response) ? response : [response]);
				const correctSelected = [...selectedIds].filter((id) => correctIds.has(id)).length;
				const incorrectSelected = [...selectedIds].filter((id) => !correctIds.has(id)).length;
				const score = Math.max(
					0,
					Math.round(((correctSelected - incorrectSelected) / correctIds.size) * maxPoints)
				);
				const isCorrect =
					correctIds.size === selectedIds.size && correctSelected === correctIds.size;
				return { isCorrect, score, maxPoints, feedback: null, needsManualGrading: false };
			}
			case 'fill_blank': {
				const qConfig = questionData.config ? JSON.parse(questionData.config) : {};
				const acceptableAnswers: string[] =
					qConfig.acceptableAnswers ||
					options.filter((o) => o.isCorrect).map((o) => o.label);
				const userAnswer = (typeof response === 'string' ? response : '').trim().toLowerCase();
				const isCorrect = acceptableAnswers.some(
					(a: string) => a.trim().toLowerCase() === userAnswer
				);
				return {
					isCorrect,
					score: isCorrect ? maxPoints : 0,
					maxPoints,
					feedback: null,
					needsManualGrading: false
				};
			}
			case 'matching': {
				const pairs = Array.isArray(response) ? response : JSON.parse(response as string);
				const qConfig = questionData.config ? JSON.parse(questionData.config) : {};
				const correctPairs: Array<{ left: string; right: string }> = qConfig.pairs || [];
				let correct = 0;
				for (const pair of pairs) {
					if (
						correctPairs.some(
							(cp) => cp.left === pair.left && cp.right === pair.right
						)
					)
						correct++;
				}
				const score =
					correctPairs.length > 0
						? Math.round((correct / correctPairs.length) * maxPoints)
						: 0;
				return {
					isCorrect: correct === correctPairs.length,
					score,
					maxPoints,
					feedback: null,
					needsManualGrading: false
				};
			}
			case 'ordering': {
				const userOrder = Array.isArray(response)
					? response
					: JSON.parse(response as string);
				const correctOrder = options
					.sort((a, b) => a.sortOrder - b.sortOrder)
					.map((o) => o.id);
				const isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
				return {
					isCorrect,
					score: isCorrect ? maxPoints : 0,
					maxPoints,
					feedback: null,
					needsManualGrading: false
				};
			}
			case 'short_answer':
			case 'essay':
				return {
					isCorrect: null,
					score: null,
					maxPoints,
					feedback: null,
					needsManualGrading: true
				};
			default:
				return {
					isCorrect: null,
					score: 0,
					maxPoints,
					feedback: 'Unknown question type',
					needsManualGrading: false
				};
		}
	}

	static async getAttemptResult(attemptId: string, userId: string) {
		const [attempt] = await db
			.select()
			.from(lmsTable.lmsQuizAttempt)
			.where(
				and(
					eq(lmsTable.lmsQuizAttempt.id, attemptId),
					eq(lmsTable.lmsQuizAttempt.userId, userId)
				)
			);
		if (!attempt) throw new Error('Attempt not found');

		const answers = await db
			.select()
			.from(lmsTable.lmsQuizAnswer)
			.where(eq(lmsTable.lmsQuizAnswer.attemptId, attemptId));

		const quiz = await QuizService.getQuizById(attempt.quizId);
		const config = quiz?.config ? JSON.parse(quiz.config) : {};

		return {
			...attempt,
			answers: config.showCorrectAnswers
				? answers
				: answers.map((a) => ({ ...a, isCorrect: undefined })),
			showExplanations: config.showExplanations
		};
	}

	static async getAttemptsByUser(quizId: string, userId: string) {
		return db
			.select()
			.from(lmsTable.lmsQuizAttempt)
			.where(
				and(
					eq(lmsTable.lmsQuizAttempt.quizId, quizId),
					eq(lmsTable.lmsQuizAttempt.userId, userId)
				)
			)
			.orderBy(desc(lmsTable.lmsQuizAttempt.startedAt));
	}

	static async getAttemptsByQuiz(quizId: string, page = 1, limit = 20) {
		const offset = (page - 1) * limit;
		return db
			.select()
			.from(lmsTable.lmsQuizAttempt)
			.where(eq(lmsTable.lmsQuizAttempt.quizId, quizId))
			.orderBy(desc(lmsTable.lmsQuizAttempt.startedAt))
			.limit(limit)
			.offset(offset);
	}
}

export default QuizAttemptService;
