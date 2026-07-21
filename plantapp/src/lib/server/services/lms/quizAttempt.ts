import { and, count, desc, eq, sql } from 'drizzle-orm';
import { randomInt, randomUUID } from 'crypto';
import { db } from '$lib/server/db';
import * as lmsTable from '$lib/server/db/lms-schema';
import { QuestionBankService } from './questionBank';
import { QuizService } from './quiz';

type SubmittedAnswer = { questionId: string; response: string | string[] };

type GradeResult = {
	isCorrect: boolean | null;
	score: number;
	maxPoints: number;
	feedback: string | null;
	needsManualGrading: boolean;
};

function shuffled<T>(items: readonly T[]): T[] {
	const result = [...items];
	for (let index = result.length - 1; index > 0; index -= 1) {
		const swapIndex = randomInt(index + 1);
		[result[index], result[swapIndex]] = [result[swapIndex], result[index]];
	}
	return result;
}

function parsedArray(value: string | string[]): unknown[] | null {
	if (Array.isArray(value)) return value;
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

/** Schema-aligned quiz-attempt lifecycle; see `services/lms/AGENTS.md` §Quiz contract. */
export class QuizAttemptService {
	static async startAttempt(quizId: string, enrollmentId: string) {
		const quiz = await QuizService.getQuizById(quizId);
		if (!quiz) throw new Error('Quiz not found');

		const completeness = await QuizService.validateQuizCompleteness(quizId);
		if (!completeness.valid) throw new Error(completeness.reason);

		const courseQuestions = await QuestionBankService.getQuestionsForCourse(quiz.courseId);
		const orderedQuestions = quiz.randomizeQuestions ? shuffled(courseQuestions) : courseQuestions;
		const questions = orderedQuestions.slice(0, quiz.questionCount ?? orderedQuestions.length);
		if (questions.length === 0) throw new Error('Quiz has no available questions');

		const totalPoints = questions.reduce((sum, question) => sum + question.points, 0);
		const attemptId = randomUUID();
		const attempt = await db.transaction(async (tx) => {
			await tx.execute(
				sql`SELECT pg_advisory_xact_lock(hashtext(${quizId}), hashtext(${enrollmentId}))`
			);
			const [existing] = await tx
				.select({ count: count() })
				.from(lmsTable.lmsQuizAttempt)
				.where(
					and(
						eq(lmsTable.lmsQuizAttempt.quizId, quizId),
						eq(lmsTable.lmsQuizAttempt.enrollmentId, enrollmentId)
					)
				);
			if ((existing?.count ?? 0) >= quiz.maxAttempts) {
				throw new Error('Maximum attempts reached');
			}

			const [created] = await tx
				.insert(lmsTable.lmsQuizAttempt)
				.values({
					id: attemptId,
					quizId,
					enrollmentId,
					startedAt: new Date(),
					totalPoints
				})
				.returning();

			await tx.insert(lmsTable.lmsQuizAnswer).values(
				questions.map((question) => ({
					id: randomUUID(),
					attemptId,
					questionId: question.id,
					answer: 'null',
					pointsAwarded: 0
				}))
			);
			return created;
		});

		const safeQuestions = await Promise.all(
			questions.map(async (question) => {
				const options = await db
					.select()
					.from(lmsTable.lmsQuestionOption)
					.where(eq(lmsTable.lmsQuestionOption.questionId, question.id))
					.orderBy(lmsTable.lmsQuestionOption.sortOrder);
				return {
					id: question.id,
					type: question.type,
					prompt: question.prompt,
					points: question.points,
					options: options.map((option) => ({
						id: option.id,
						label: option.label,
						sortOrder: option.sortOrder
					}))
				};
			})
		);

		return { attemptId: attempt.id, timeLimit: quiz.timeLimit, questions: safeQuestions };
	}

	static async submitAttempt(attemptId: string, answers: SubmittedAnswer[]) {
		const [attempt] = await db
			.select()
			.from(lmsTable.lmsQuizAttempt)
			.where(eq(lmsTable.lmsQuizAttempt.id, attemptId));
		if (!attempt) throw new Error('Attempt not found');
		if (attempt.submittedAt) throw new Error('Attempt already submitted');

		const quiz = await QuizService.getQuizById(attempt.quizId);
		if (!quiz) throw new Error('Quiz not found');
		const elapsedSeconds = Math.max(0, Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000));
		if (quiz.timeLimit && elapsedSeconds > quiz.timeLimit) {
			throw new Error('Time limit exceeded');
		}

		const storedAnswers = await db
			.select()
			.from(lmsTable.lmsQuizAnswer)
			.where(eq(lmsTable.lmsQuizAnswer.attemptId, attemptId));
		if (storedAnswers.length === 0) throw new Error('Attempt question set is unavailable');

		const submittedByQuestion = new Map<string, SubmittedAnswer>();
		for (const answer of answers) {
			if (submittedByQuestion.has(answer.questionId)) {
				throw new Error('Each quiz question can only be answered once');
			}
			submittedByQuestion.set(answer.questionId, answer);
		}
		const storedQuestionIds = new Set(storedAnswers.map((answer) => answer.questionId));
		if ([...submittedByQuestion.keys()].some((questionId) => !storedQuestionIds.has(questionId))) {
			throw new Error('Submitted answers must belong to this quiz attempt');
		}

		const gradedAnswers = await Promise.all(
			storedAnswers.map(async (storedAnswer) => {
				const submitted = submittedByQuestion.get(storedAnswer.questionId);
				if (!submitted) {
					return {
						storedAnswer,
						serializedAnswer: 'null',
						result: {
							isCorrect: false,
							score: 0,
							maxPoints: 0,
							feedback: 'Not answered',
							needsManualGrading: false
						} satisfies GradeResult
					};
				}

				return {
					storedAnswer,
					serializedAnswer: JSON.stringify(submitted.response),
					result: await this.autoGrade(submitted.questionId, submitted.response)
				};
			})
		);

		const totalScore = gradedAnswers.reduce((sum, answer) => sum + answer.result.score, 0);
		const totalPoints = attempt.totalPoints ?? gradedAnswers.reduce((sum, answer) => sum + answer.result.maxPoints, 0);
		const needsManualGrading = gradedAnswers.some((answer) => answer.result.needsManualGrading);
		const scorePercent = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
		const passed = needsManualGrading ? null : scorePercent >= quiz.passingScore;

		await db.transaction(async (tx) => {
			const [lockedAttempt] = await tx
				.select()
				.from(lmsTable.lmsQuizAttempt)
				.where(eq(lmsTable.lmsQuizAttempt.id, attemptId))
				.for('update');
			if (!lockedAttempt || lockedAttempt.submittedAt) {
				throw new Error('Attempt already submitted');
			}

			for (const answer of gradedAnswers) {
				await tx
					.update(lmsTable.lmsQuizAnswer)
					.set({
						answer: answer.serializedAnswer,
						isCorrect: answer.result.isCorrect,
						pointsAwarded: answer.result.score,
						feedback: answer.result.feedback
					})
					.where(eq(lmsTable.lmsQuizAnswer.id, answer.storedAnswer.id));
			}

			await tx
				.update(lmsTable.lmsQuizAttempt)
				.set({
					submittedAt: new Date(),
					timeSpent: elapsedSeconds,
					score: totalScore,
					totalPoints,
					passed
				})
				.where(eq(lmsTable.lmsQuizAttempt.id, attemptId));
		});

		return {
			attemptId,
			score: totalScore,
			totalPoints,
			maxScore: totalPoints,
			scorePercent,
			passed,
			needsManualGrading
		};
	}

	static async autoGrade(questionId: string, response: string | string[]): Promise<GradeResult> {
		const questionData = await QuestionBankService.getQuestionWithOptions(questionId);
		if (!questionData) {
			return {
				isCorrect: false,
				score: 0,
				maxPoints: 0,
				feedback: 'Question not found',
				needsManualGrading: false
			};
		}

		const maxPoints = questionData.points;
		const options = questionData.options;
		switch (questionData.type) {
			case 'multiple_choice':
			case 'true_false': {
				const correctOption = options.find((option) => option.isCorrect);
				const isCorrect = correctOption?.id === response;
				return { isCorrect, score: isCorrect ? maxPoints : 0, maxPoints, feedback: null, needsManualGrading: false };
			}
			case 'multi_select': {
				const correctIds = new Set(options.filter((option) => option.isCorrect).map((option) => option.id));
				const selectedIds = new Set(Array.isArray(response) ? response : [response]);
				if (correctIds.size === 0) return { isCorrect: false, score: 0, maxPoints, feedback: null, needsManualGrading: false };
				const correctSelected = [...selectedIds].filter((id) => correctIds.has(id)).length;
				const incorrectSelected = [...selectedIds].filter((id) => !correctIds.has(id)).length;
				const score = Math.max(0, Math.round(((correctSelected - incorrectSelected) / correctIds.size) * maxPoints));
				return {
					isCorrect: correctIds.size === selectedIds.size && correctSelected === correctIds.size,
					score,
					maxPoints,
					feedback: null,
					needsManualGrading: false
				};
			}
			case 'fill_blank': {
				const config = questionData.config ? JSON.parse(questionData.config) : {};
				const acceptableAnswers: string[] = config.acceptableAnswers || options.filter((option) => option.isCorrect).map((option) => option.label);
				const userAnswer = (typeof response === 'string' ? response : '').trim().toLowerCase();
				const isCorrect = acceptableAnswers.some((answer) => answer.trim().toLowerCase() === userAnswer);
				return { isCorrect, score: isCorrect ? maxPoints : 0, maxPoints, feedback: null, needsManualGrading: false };
			}
			case 'matching': {
				const pairs = parsedArray(response);
				const config = questionData.config ? JSON.parse(questionData.config) : {};
				const correctPairs: Array<{ left: string; right: string }> = config.pairs || [];
				if (!pairs || correctPairs.length === 0) return { isCorrect: false, score: 0, maxPoints, feedback: null, needsManualGrading: false };
				const submittedPairs = pairs
					.map((pair) => (typeof pair === 'object' && pair !== null ? leftRight(pair) : null))
					.filter((pair): pair is { left: string; right: string } => pair !== null);
				const correct = submittedPairs.filter((pair) =>
					correctPairs.some((expected) => pair.left === expected.left && pair.right === expected.right)
				).length;
				const score = Math.round((correct / correctPairs.length) * maxPoints);
				return { isCorrect: correct === correctPairs.length, score, maxPoints, feedback: null, needsManualGrading: false };
			}
			case 'ordering': {
				const userOrder = parsedArray(response);
				const correctOrder = [...options].sort((left, right) => left.sortOrder - right.sortOrder).map((option) => option.id);
				const isCorrect = userOrder !== null && JSON.stringify(userOrder) === JSON.stringify(correctOrder);
				return { isCorrect, score: isCorrect ? maxPoints : 0, maxPoints, feedback: null, needsManualGrading: false };
			}
			case 'short_answer':
			case 'essay':
				return { isCorrect: null, score: 0, maxPoints, feedback: null, needsManualGrading: true };
			default:
				return { isCorrect: false, score: 0, maxPoints, feedback: 'Unknown question type', needsManualGrading: false };
		}
	}

	static async getAttemptResult(attemptId: string, userId: string) {
		const [record] = await db
			.select({ attempt: lmsTable.lmsQuizAttempt, enrollment: lmsTable.lmsEnrollment })
			.from(lmsTable.lmsQuizAttempt)
			.innerJoin(lmsTable.lmsEnrollment, eq(lmsTable.lmsQuizAttempt.enrollmentId, lmsTable.lmsEnrollment.id))
			.where(and(eq(lmsTable.lmsQuizAttempt.id, attemptId), eq(lmsTable.lmsEnrollment.userId, userId)))
			.limit(1);
		if (!record) throw new Error('Attempt not found');

		const answers = await db
			.select()
			.from(lmsTable.lmsQuizAnswer)
			.where(eq(lmsTable.lmsQuizAnswer.attemptId, attemptId));
		const quiz = await QuizService.getQuizById(record.attempt.quizId);
		if (!quiz) throw new Error('Quiz not found');

		return {
			...record.attempt,
			answers: quiz.showCorrectAnswers
				? answers
				: answers.map(({ isCorrect, ...answer }) => answer)
		};
	}

	static async getAttemptsByUser(quizId: string, userId: string) {
		const rows = await db
			.select({ attempt: lmsTable.lmsQuizAttempt })
			.from(lmsTable.lmsQuizAttempt)
			.innerJoin(lmsTable.lmsEnrollment, eq(lmsTable.lmsQuizAttempt.enrollmentId, lmsTable.lmsEnrollment.id))
			.where(and(eq(lmsTable.lmsQuizAttempt.quizId, quizId), eq(lmsTable.lmsEnrollment.userId, userId)))
			.orderBy(desc(lmsTable.lmsQuizAttempt.startedAt));
		return rows.map(({ attempt }) => attempt);
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

function leftRight(value: object): { left: string; right: string } | null {
	if (!('left' in value) || !('right' in value)) return null;
	const pair = value as { left?: unknown; right?: unknown };
	return typeof pair.left === 'string' && typeof pair.right === 'string'
		? { left: pair.left, right: pair.right }
		: null;
}

export default QuizAttemptService;
