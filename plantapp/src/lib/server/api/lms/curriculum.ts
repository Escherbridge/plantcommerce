import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, publicProcedure, router } from '../trpc';
import { CurriculumService } from '../../services/lms/curriculum';
import { ContentBlockService } from '../../services/lms/contentBlock';
import { LmsAccessService } from '../../services/lms/access';
import { LmsCourseService } from '../../services/lms/course';
import { isPubliclyReadableCourse, publishedCurriculumView } from '../../services/lms/publicRead';

export const lmsCurriculumRouter = router({
	// Get full curriculum tree for a course
	getCurriculum: publicProcedure
		.input(z.object({ courseId: z.string() }))
		.query(async ({ ctx, input }) => {
			const course = await LmsCourseService.getCourseById(input.courseId);
			if (!course) throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
			const manager =
				!!ctx.user &&
				(ctx.user.role === 'admin' ||
					(ctx.user.role === 'instructor' && course.instructorId === ctx.user.id));
			const curriculum = await CurriculumService.getFullCurriculum(input.courseId);
			if (manager) return curriculum;
			if (course.status !== 'published') {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
			}
			const published = publishedCurriculumView(curriculum);
			if (isPubliclyReadableCourse(course)) return published;
			if (!ctx.user) {
				throw new TRPCError({ code: 'FORBIDDEN', message: 'An active enrollment is required' });
			}
			await LmsAccessService.requireCourseRead(ctx.user, input.courseId);
			return published;
		}),

	// === MODULES ===
	getModules: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.query(async ({ ctx, input }) => {
			const access = await LmsAccessService.requireCourseRead(ctx.user, input.courseId);
			const modules = await CurriculumService.getModulesByCourse(input.courseId);
			return access.kind === 'manager' ? modules : modules.filter((module) => module.isPublished);
		}),

	createModule: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				title: z.string().min(1),
				slug: z.string().min(1),
				description: z.string().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireCourseManager(ctx.user, input.courseId);
			return CurriculumService.createModule(input);
		}),

	updateModule: protectedProcedure
		.input(
			z.object({
				moduleId: z.string(),
				title: z.string().min(1).optional(),
				slug: z.string().min(1).optional(),
				description: z.string().optional(),
				isPublished: z.boolean().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { moduleId, ...params } = input;
			await LmsAccessService.requireModuleManager(ctx.user, moduleId);
			return CurriculumService.updateModule(moduleId, params);
		}),

	deleteModule: protectedProcedure
		.input(z.object({ moduleId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireModuleManager(ctx.user, input.moduleId);
			await CurriculumService.deleteModule(input.moduleId);
			return { success: true };
		}),

	reorderModules: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				moduleIds: z.array(z.string())
			})
		)
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireCourseManager(ctx.user, input.courseId);
			await CurriculumService.reorderModules(input.courseId, input.moduleIds);
			return { success: true };
		}),

	// === LESSONS ===
	getLessons: protectedProcedure
		.input(z.object({ moduleId: z.string() }))
		.query(async ({ ctx, input }) => {
			const access = await LmsAccessService.requireModuleRead(ctx.user, input.moduleId);
			const lessons = await CurriculumService.getLessonsByModule(input.moduleId);
			return access.kind === 'manager' ? lessons : lessons.filter((lesson) => lesson.isPublished);
		}),

	createLesson: protectedProcedure
		.input(
			z.object({
				moduleId: z.string(),
				title: z.string().min(1),
				slug: z.string().min(1),
				description: z.string().optional(),
				isPreview: z.boolean().default(false),
				estimatedMinutes: z.number().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireModuleManager(ctx.user, input.moduleId);
			return CurriculumService.createLesson(input);
		}),

	updateLesson: protectedProcedure
		.input(
			z.object({
				lessonId: z.string(),
				title: z.string().min(1).optional(),
				slug: z.string().min(1).optional(),
				description: z.string().optional(),
				isPublished: z.boolean().optional(),
				isPreview: z.boolean().optional(),
				estimatedMinutes: z.number().optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { lessonId, ...params } = input;
			await LmsAccessService.requireLessonManager(ctx.user, lessonId);
			return CurriculumService.updateLesson(lessonId, params);
		}),

	deleteLesson: protectedProcedure
		.input(z.object({ lessonId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireLessonManager(ctx.user, input.lessonId);
			await CurriculumService.deleteLesson(input.lessonId);
			return { success: true };
		}),

	reorderLessons: protectedProcedure
		.input(
			z.object({
				moduleId: z.string(),
				lessonIds: z.array(z.string())
			})
		)
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireModuleManager(ctx.user, input.moduleId);
			await CurriculumService.reorderLessons(input.moduleId, input.lessonIds);
			return { success: true };
		}),

	moveLesson: protectedProcedure
		.input(
			z.object({
				lessonId: z.string(),
				targetModuleId: z.string(),
				position: z.number().min(0)
			})
		)
		.mutation(async ({ ctx, input }) => {
			const source = await LmsAccessService.requireLessonManager(ctx.user, input.lessonId);
			const target = await LmsAccessService.requireModuleManager(ctx.user, input.targetModuleId);
			if (source.course.id !== target.course.id) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Lessons can only be moved within the same course'
				});
			}
			await CurriculumService.moveLesson(input.lessonId, input.targetModuleId, input.position);
			return { success: true };
		}),

	// === CONTENT BLOCKS ===
	getContentBlocks: publicProcedure
		.input(z.object({ lessonId: z.string() }))
		.query(({ ctx, input }) => LmsAccessService.readLessonBlocks(ctx.user, input.lessonId)),

	createContentBlock: protectedProcedure
		.input(
			z.object({
				lessonId: z.string(),
				type: z.enum(['video', 'text', 'slides', 'download', 'audio', 'embed', 'code', 'image']),
				title: z.string().optional(),
				content: z.string().optional(),
				fileId: z.string().optional(),
				config: z.record(z.string(), z.unknown()).optional(),
				isRequired: z.boolean().default(true),
				completionThreshold: z.number().min(0).max(100).default(100)
			})
		)
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireLessonManager(ctx.user, input.lessonId);
			return ContentBlockService.createContentBlock(input);
		}),

	updateContentBlock: protectedProcedure
		.input(
			z.object({
				blockId: z.string(),
				type: z
					.enum(['video', 'text', 'slides', 'download', 'audio', 'embed', 'code', 'image'])
					.optional(),
				title: z.string().optional(),
				content: z.string().optional(),
				fileId: z.string().optional(),
				config: z.record(z.string(), z.unknown()).optional(),
				isRequired: z.boolean().optional(),
				completionThreshold: z.number().min(0).max(100).optional()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { blockId, ...params } = input;
			await LmsAccessService.requireContentBlockManager(ctx.user, blockId);
			return ContentBlockService.updateContentBlock(blockId, params);
		}),

	deleteContentBlock: protectedProcedure
		.input(z.object({ blockId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireContentBlockManager(ctx.user, input.blockId);
			await ContentBlockService.deleteContentBlock(input.blockId);
			return { success: true };
		}),

	reorderContentBlocks: protectedProcedure
		.input(
			z.object({
				lessonId: z.string(),
				blockIds: z.array(z.string())
			})
		)
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireLessonManager(ctx.user, input.lessonId);
			await ContentBlockService.reorderContentBlocks(input.lessonId, input.blockIds);
			return { success: true };
		})
});
