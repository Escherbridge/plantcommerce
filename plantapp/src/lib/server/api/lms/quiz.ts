import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { QuestionBankService } from '../../services/lms/questionBank';
import { QuizService } from '../../services/lms/quiz';
import { QuizAttemptService } from '../../services/lms/quizAttempt';
import { GradingService } from '../../services/lms/grading';
import { LmsAccessService } from '../../services/lms/access';

export const quizRouter = router({
	// Quiz CRUD
	createQuiz: protectedProcedure
		.input(
			z.object({
				lessonId: z.string().optional(),
				moduleId: z.string().optional(),
				title: z.string().min(1),
				description: z.string().optional(),
				timeLimit: z.number().optional(),
				passingScore: z.number().min(0).max(100).optional(),
				maxAttempts: z.number().optional(),
				randomizeQuestions: z.boolean().optional(),
				questionCount: z.number().optional(),
				showCorrectAnswers: z.boolean().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			if (!input.lessonId && !input.moduleId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'A quiz must belong to a lesson or module'
				});
			}

			let courseId: string;
			if (input.lessonId) {
				const lesson = await LmsAccessService.requireLessonManager(ctx.user, input.lessonId);
				if (input.moduleId && input.moduleId !== lesson.module.id) {
					throw new TRPCError({
						code: 'BAD_REQUEST',
						message: 'The selected lesson does not belong to the selected module'
					});
				}
				courseId = lesson.course.id;
			} else {
				const module = await LmsAccessService.requireModuleManager(ctx.user, input.moduleId!);
				courseId = module.course.id;
			}

			return QuizService.createQuiz({ ...input, courseId });
		}),

	updateQuiz: protectedProcedure
		.input(
			z.object({
				quizId: z.string(),
				title: z.string().optional(),
				description: z.string().optional(),
				timeLimit: z.number().optional(),
				passingScore: z.number().optional(),
				maxAttempts: z.number().optional(),
				randomizeQuestions: z.boolean().optional(),
				questionCount: z.number().optional(),
				showCorrectAnswers: z.boolean().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { quizId, ...data } = input;
			await LmsAccessService.requireQuizManager(ctx.user, quizId);
			return QuizService.updateQuiz(quizId, data);
		}),

	deleteQuiz: protectedProcedure
		.input(z.object({ quizId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireQuizManager(ctx.user, input.quizId);
			await QuizService.deleteQuiz(input.quizId);
			return { success: true };
		}),

	getQuiz: protectedProcedure
		.input(z.object({ quizId: z.string() }))
		.query(async ({ ctx, input }) => {
			await LmsAccessService.requireQuizRead(ctx.user, input.quizId);
			return QuizService.getQuizById(input.quizId);
		}),

	// Question Bank
	createBank: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				name: z.string().min(1),
				description: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireCourseManager(ctx.user, input.courseId);
			return QuestionBankService.createBank(input.courseId, input.name, input.description);
		}),

	// Question CRUD
	createQuestion: protectedProcedure
		.input(
			z.object({
				bankId: z.string(),
				type: z.enum([
					'multiple_choice',
					'multi_select',
					'true_false',
					'fill_blank',
					'matching',
					'short_answer',
					'essay',
					'ordering'
				]),
				prompt: z.string().min(1),
				config: z.string().optional(),
				points: z.number().optional(),
				sortOrder: z.number().optional(),
				options: z
					.array(
						z.object({
							label: z.string(),
							isCorrect: z.boolean(),
							sortOrder: z.number().optional()
						})
					)
					.optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireQuestionBankManager(ctx.user, input.bankId);
			return QuestionBankService.createQuestion(input.bankId, input);
		}),

	updateQuestion: protectedProcedure
		.input(
			z.object({
				questionId: z.string(),
				type: z
					.enum([
						'multiple_choice',
						'multi_select',
						'true_false',
						'fill_blank',
						'matching',
						'short_answer',
						'essay',
						'ordering'
					])
					.optional(),
				prompt: z.string().optional(),
				config: z.string().optional(),
				points: z.number().optional(),
				options: z
					.array(
						z.object({
							label: z.string(),
							isCorrect: z.boolean(),
							sortOrder: z.number().optional()
						})
					)
					.optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { questionId, ...data } = input;
			await LmsAccessService.requireQuestionManager(ctx.user, questionId);
			return QuestionBankService.updateQuestion(questionId, data);
		}),

	deleteQuestion: protectedProcedure
		.input(z.object({ questionId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireQuestionManager(ctx.user, input.questionId);
			await QuestionBankService.deleteQuestion(input.questionId);
			return { success: true };
		}),

	listQuestions: protectedProcedure
		.input(
			z.object({
				bankId: z.string(),
				type: z.string().optional(),
				page: z.number().optional(),
				limit: z.number().optional()
			})
		)
		.query(async ({ ctx, input }) => {
			await LmsAccessService.requireQuestionBankManager(ctx.user, input.bankId);
			return QuestionBankService.listQuestions(input.bankId, input.type, input.page, input.limit);
		}),

	// Quiz Attempts
	startAttempt: protectedProcedure
		.input(z.object({ quizId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { enrollment } = await LmsAccessService.requireQuizLearner(ctx.user, input.quizId);
			return QuizAttemptService.startAttempt(input.quizId, enrollment.id);
		}),

	submitAttempt: protectedProcedure
		.input(
			z.object({
				attemptId: z.string(),
				answers: z.array(
					z.object({
						questionId: z.string(),
						response: z.union([z.string(), z.array(z.string())])
					})
				)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const attempt = await LmsAccessService.requireQuizAttemptOwner(ctx.user, input.attemptId);
			await Promise.all(
				input.answers.map((answer) =>
					LmsAccessService.requireQuestionForCourse(attempt.course.id, answer.questionId)
				)
			);
			return QuizAttemptService.submitAttempt(input.attemptId, input.answers);
		}),

	getResult: protectedProcedure
		.input(z.object({ attemptId: z.string() }))
		.query(async ({ ctx, input }) => {
			await LmsAccessService.requireQuizAttemptOwner(ctx.user, input.attemptId);
			return QuizAttemptService.getAttemptResult(input.attemptId, ctx.user.id);
		}),

	myAttempts: protectedProcedure
		.input(z.object({ quizId: z.string() }))
		.query(async ({ ctx, input }) => {
			await LmsAccessService.requireQuizLearner(ctx.user, input.quizId);
			return QuizAttemptService.getAttemptsByUser(input.quizId, ctx.user.id);
		}),

	// Grading
	gradeAnswer: protectedProcedure
		.input(
			z.object({
				answerId: z.string(),
				score: z.number().min(0),
				feedback: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireAnswerManager(ctx.user, input.answerId);
			return GradingService.gradeAnswer(input.answerId, input.score, input.feedback, ctx.user.id);
		}),

	gradingQueue: protectedProcedure
		.input(z.object({ courseId: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			if (input.courseId) {
				await LmsAccessService.requireCourseManager(ctx.user, input.courseId);
			} else {
				LmsAccessService.requireAdmin(ctx.user);
			}
			return GradingService.getGradingQueue(input.courseId);
		})
});
