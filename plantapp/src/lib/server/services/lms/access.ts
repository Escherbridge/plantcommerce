import { TRPCError } from '@trpc/server';
import { and, eq, gt, isNull, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import * as lmsTable from '$lib/server/db/lms-schema';

export interface LmsAccessActor {
	id: string;
	role: string;
}

export interface LmsCourseReadAccess {
	course: lmsTable.LmsCourse;
	enrollment: lmsTable.LmsEnrollment | null;
	kind: 'manager' | 'learner';
}

function notFound(message: string): never {
	throw new TRPCError({ code: 'NOT_FOUND', message });
}

function forbidden(message = 'You do not have access to this LMS resource'): never {
	throw new TRPCError({ code: 'FORBIDDEN', message });
}

export class LmsAccessService {
	static requireAdmin(actor: LmsAccessActor): void {
		if (actor.role !== 'admin') {
			forbidden('Administrator access is required');
		}
	}

	static requireCourseCreator(actor: LmsAccessActor): void {
		if (actor.role !== 'admin' && actor.role !== 'instructor') {
			forbidden('Instructor access is required');
		}
	}

	static async requirePublishedCourse(courseId: string): Promise<lmsTable.LmsCourse> {
		const course = await this.findCourse(courseId);
		if (course.status !== 'published') {
			notFound('Course not found');
		}
		return course;
	}

	static async requireCourseManager(
		actor: LmsAccessActor,
		courseId: string
	): Promise<lmsTable.LmsCourse> {
		const course = await this.findCourse(courseId);
		if (actor.role === 'admin') {
			return course;
		}
		if (actor.role === 'instructor' && course.instructorId === actor.id) {
			return course;
		}
		forbidden('You can only manage courses that you own');
	}

	static async requireCourseRead(
		actor: LmsAccessActor,
		courseId: string,
		now = new Date()
	): Promise<LmsCourseReadAccess> {
		const course = await this.findCourse(courseId);
		if (
			actor.role === 'admin' ||
			(actor.role === 'instructor' && course.instructorId === actor.id)
		) {
			return { course, enrollment: null, kind: 'manager' };
		}

		if (course.status !== 'published') {
			notFound('Course not found');
		}

		const enrollment = await this.findActiveEnrollment(actor.id, course.id, now);
		return { course, enrollment, kind: 'learner' };
	}

	static async requireActiveEnrollment(
		actor: LmsAccessActor,
		courseId: string,
		now = new Date()
	): Promise<{ course: lmsTable.LmsCourse; enrollment: lmsTable.LmsEnrollment }> {
		const course = await this.requirePublishedCourse(courseId);
		const enrollment = await this.findActiveEnrollment(actor.id, course.id, now);
		return { course, enrollment };
	}

	static async requireEnrollmentManager(actor: LmsAccessActor, enrollmentId: string) {
		const enrollment = await this.findEnrollment(enrollmentId);
		const course = await this.requireCourseManager(actor, enrollment.courseId);
		return { course, enrollment };
	}

	static async requireModuleManager(actor: LmsAccessActor, moduleId: string) {
		const module = await this.findModule(moduleId);
		const course = await this.requireCourseManager(actor, module.courseId);
		return { course, module };
	}

	static async requireModuleRead(actor: LmsAccessActor, moduleId: string) {
		const module = await this.findModule(moduleId);
		const access = await this.requireCourseRead(actor, module.courseId);
		if (access.kind === 'learner' && !module.isPublished) {
			forbidden('This module is not available to learners');
		}
		return { ...access, module };
	}

	static async requireLessonManager(actor: LmsAccessActor, lessonId: string) {
		const lesson = await this.findLesson(lessonId);
		const { course, module } = await this.requireModuleManager(actor, lesson.moduleId);
		return { course, module, lesson };
	}

	static async requireLessonRead(actor: LmsAccessActor, lessonId: string) {
		const lesson = await this.findLesson(lessonId);
		const access = await this.requireModuleRead(actor, lesson.moduleId);
		if (access.kind === 'learner' && !lesson.isPublished) {
			forbidden('This lesson is not available to learners');
		}
		return { ...access, lesson };
	}

	static async requireContentBlockManager(actor: LmsAccessActor, blockId: string) {
		const block = await this.findContentBlock(blockId);
		const { course, module, lesson } = await this.requireLessonManager(actor, block.lessonId);
		return { course, module, lesson, block };
	}

	static async requireContentBlockForCourse(
		courseId: string,
		blockId: string,
		learnerVisible = false
	) {
		const block = await this.findContentBlock(blockId);
		const lesson = await this.findLesson(block.lessonId);
		const module = await this.findModule(lesson.moduleId);
		if (module.courseId !== courseId) {
			forbidden('Content does not belong to this course');
		}
		if (learnerVisible && (!module.isPublished || !lesson.isPublished)) {
			forbidden('This content is not available to learners');
		}
		return { module, lesson, block };
	}

	static async requireQuizManager(actor: LmsAccessActor, quizId: string) {
		const quiz = await this.findQuiz(quizId);
		const course = await this.requireCourseManager(actor, quiz.courseId);
		await this.assertQuizStructure(quiz, false);
		return { course, quiz };
	}

	static async requireQuizLearner(actor: LmsAccessActor, quizId: string) {
		const quiz = await this.findQuiz(quizId);
		const { course, enrollment } = await this.requireActiveEnrollment(actor, quiz.courseId);
		await this.assertQuizStructure(quiz, true);
		return { course, enrollment, quiz };
	}

	static async requireQuizRead(actor: LmsAccessActor, quizId: string) {
		const quiz = await this.findQuiz(quizId);
		const access = await this.requireCourseRead(actor, quiz.courseId);
		await this.assertQuizStructure(quiz, access.kind === 'learner');
		return { ...access, quiz };
	}

	static async requireQuestionBankManager(actor: LmsAccessActor, bankId: string) {
		const bank = await this.findQuestionBank(bankId);
		const course = await this.requireCourseManager(actor, bank.courseId);
		return { course, bank };
	}

	static async requireQuestionManager(actor: LmsAccessActor, questionId: string) {
		const question = await this.findQuestion(questionId);
		const { course, bank } = await this.requireQuestionBankManager(actor, question.bankId);
		return { course, bank, question };
	}

	static async requireQuestionForCourse(courseId: string, questionId: string) {
		const question = await this.findQuestion(questionId);
		const bank = await this.findQuestionBank(question.bankId);
		if (bank.courseId !== courseId) {
			forbidden('Question does not belong to this course');
		}
		return { bank, question };
	}

	static async requireQuizAttemptOwner(actor: LmsAccessActor, attemptId: string) {
		const context = await this.findAttemptContext(attemptId);
		this.assertAttemptCourseIntegrity(context);
		if (context.enrollment.userId !== actor.id) {
			forbidden('You can only access your own quiz attempts');
		}

		const { course, enrollment } = await this.requireActiveEnrollment(actor, context.quiz.courseId);
		if (enrollment.id !== context.attempt.enrollmentId) {
			forbidden('Quiz attempt does not belong to the active enrollment');
		}
		await this.assertQuizStructure(context.quiz, true);
		return { course, enrollment, quiz: context.quiz, attempt: context.attempt };
	}

	static async requireQuizAttemptManager(actor: LmsAccessActor, attemptId: string) {
		const context = await this.findAttemptContext(attemptId);
		this.assertAttemptCourseIntegrity(context);
		const course = await this.requireCourseManager(actor, context.quiz.courseId);
		return { course, enrollment: context.enrollment, quiz: context.quiz, attempt: context.attempt };
	}

	static async requireAnswerManager(actor: LmsAccessActor, answerId: string) {
		const [answer] = await db
			.select()
			.from(lmsTable.lmsQuizAnswer)
			.where(eq(lmsTable.lmsQuizAnswer.id, answerId))
			.limit(1);
		if (!answer) {
			notFound('Quiz answer not found');
		}

		const context = await this.requireQuizAttemptManager(actor, answer.attemptId);
		await this.requireQuestionForCourse(context.course.id, answer.questionId);
		return { ...context, answer };
	}

	static async requireLmsFileManager(actor: LmsAccessActor, fileId: string) {
		const file = await this.findLmsFile(fileId);
		const course = await this.requireCourseManager(actor, file.entityId);
		return { course, file };
	}

	static async requireLmsFileRead(actor: LmsAccessActor, fileId: string) {
		const file = await this.findLmsFile(fileId);
		const access = await this.requireCourseRead(actor, file.entityId);
		if (access.kind === 'learner') {
			await this.assertLearnerCanReadLmsFile(access.course.id, file.id);
		}
		return { ...access, file };
	}

	private static async findCourse(courseId: string): Promise<lmsTable.LmsCourse> {
		const [course] = await db
			.select()
			.from(lmsTable.lmsCourse)
			.where(eq(lmsTable.lmsCourse.id, courseId))
			.limit(1);
		if (!course) {
			notFound('Course not found');
		}
		return course;
	}

	private static async findActiveEnrollment(
		userId: string,
		courseId: string,
		now: Date
	): Promise<lmsTable.LmsEnrollment> {
		const [enrollment] = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(
				and(
					eq(lmsTable.lmsEnrollment.userId, userId),
					eq(lmsTable.lmsEnrollment.courseId, courseId),
					eq(lmsTable.lmsEnrollment.status, 'active'),
					or(isNull(lmsTable.lmsEnrollment.expiresAt), gt(lmsTable.lmsEnrollment.expiresAt, now))
				)
			)
			.limit(1);
		if (!enrollment) {
			forbidden('An active enrollment is required');
		}
		return enrollment;
	}

	private static async findEnrollment(enrollmentId: string): Promise<lmsTable.LmsEnrollment> {
		const [enrollment] = await db
			.select()
			.from(lmsTable.lmsEnrollment)
			.where(eq(lmsTable.lmsEnrollment.id, enrollmentId))
			.limit(1);
		if (!enrollment) {
			notFound('Enrollment not found');
		}
		return enrollment;
	}

	private static async findModule(moduleId: string): Promise<lmsTable.LmsModule> {
		const [module] = await db
			.select()
			.from(lmsTable.lmsModule)
			.where(eq(lmsTable.lmsModule.id, moduleId))
			.limit(1);
		if (!module) {
			notFound('Module not found');
		}
		return module;
	}

	private static async findLesson(lessonId: string): Promise<lmsTable.LmsLesson> {
		const [lesson] = await db
			.select()
			.from(lmsTable.lmsLesson)
			.where(eq(lmsTable.lmsLesson.id, lessonId))
			.limit(1);
		if (!lesson) {
			notFound('Lesson not found');
		}
		return lesson;
	}

	private static async findContentBlock(blockId: string): Promise<lmsTable.LmsContentBlock> {
		const [block] = await db
			.select()
			.from(lmsTable.lmsContentBlock)
			.where(eq(lmsTable.lmsContentBlock.id, blockId))
			.limit(1);
		if (!block) {
			notFound('Content block not found');
		}
		return block;
	}

	private static async findQuiz(quizId: string): Promise<lmsTable.LmsQuiz> {
		const [quiz] = await db
			.select()
			.from(lmsTable.lmsQuiz)
			.where(eq(lmsTable.lmsQuiz.id, quizId))
			.limit(1);
		if (!quiz) {
			notFound('Quiz not found');
		}
		return quiz;
	}

	private static async findQuestionBank(bankId: string): Promise<lmsTable.LmsQuestionBank> {
		const [bank] = await db
			.select()
			.from(lmsTable.lmsQuestionBank)
			.where(eq(lmsTable.lmsQuestionBank.id, bankId))
			.limit(1);
		if (!bank) {
			notFound('Question bank not found');
		}
		return bank;
	}

	private static async findQuestion(questionId: string): Promise<lmsTable.LmsQuestion> {
		const [question] = await db
			.select()
			.from(lmsTable.lmsQuestion)
			.where(eq(lmsTable.lmsQuestion.id, questionId))
			.limit(1);
		if (!question) {
			notFound('Question not found');
		}
		return question;
	}

	private static async findAttemptContext(attemptId: string) {
		const [context] = await db
			.select({
				attempt: lmsTable.lmsQuizAttempt,
				quiz: lmsTable.lmsQuiz,
				enrollment: lmsTable.lmsEnrollment
			})
			.from(lmsTable.lmsQuizAttempt)
			.innerJoin(lmsTable.lmsQuiz, eq(lmsTable.lmsQuizAttempt.quizId, lmsTable.lmsQuiz.id))
			.innerJoin(
				lmsTable.lmsEnrollment,
				eq(lmsTable.lmsQuizAttempt.enrollmentId, lmsTable.lmsEnrollment.id)
			)
			.where(eq(lmsTable.lmsQuizAttempt.id, attemptId))
			.limit(1);
		if (!context) {
			notFound('Quiz attempt not found');
		}
		return context;
	}

	private static assertAttemptCourseIntegrity(context: {
		attempt: lmsTable.LmsQuizAttempt;
		quiz: lmsTable.LmsQuiz;
		enrollment: lmsTable.LmsEnrollment;
	}): void {
		if (context.quiz.courseId !== context.enrollment.courseId) {
			forbidden('Quiz attempt has an invalid course association');
		}
	}

	private static async assertQuizStructure(
		quiz: lmsTable.LmsQuiz,
		learnerVisible: boolean
	): Promise<void> {
		if (quiz.moduleId) {
			const module = await this.findModule(quiz.moduleId);
			if (module.courseId !== quiz.courseId || (learnerVisible && !module.isPublished)) {
				forbidden('Quiz is not available in this course');
			}
		}

		if (quiz.lessonId) {
			const lesson = await this.findLesson(quiz.lessonId);
			const module = await this.findModule(lesson.moduleId);
			if (
				module.courseId !== quiz.courseId ||
				(quiz.moduleId && lesson.moduleId !== quiz.moduleId) ||
				(learnerVisible && (!module.isPublished || !lesson.isPublished))
			) {
				forbidden('Quiz is not available in this course');
			}
		}
	}

	private static async findLmsFile(fileId: string) {
		const [file] = await db.select().from(table.file).where(eq(table.file.id, fileId)).limit(1);
		if (!file || String(file.entityType) !== 'lms' || !file.entityId) {
			notFound('LMS media not found');
		}
		return file;
	}

	private static async assertLearnerCanReadLmsFile(
		courseId: string,
		fileId: string
	): Promise<void> {
		const [contentBlock] = await db
			.select({ id: lmsTable.lmsContentBlock.id })
			.from(lmsTable.lmsContentBlock)
			.innerJoin(lmsTable.lmsLesson, eq(lmsTable.lmsContentBlock.lessonId, lmsTable.lmsLesson.id))
			.innerJoin(lmsTable.lmsModule, eq(lmsTable.lmsLesson.moduleId, lmsTable.lmsModule.id))
			.where(
				and(
					eq(lmsTable.lmsContentBlock.fileId, fileId),
					eq(lmsTable.lmsModule.courseId, courseId),
					eq(lmsTable.lmsModule.isPublished, true),
					eq(lmsTable.lmsLesson.isPublished, true)
				)
			)
			.limit(1);
		if (!contentBlock) {
			forbidden('This media is not available to learners');
		}
	}
}
