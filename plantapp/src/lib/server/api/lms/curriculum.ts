import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../trpc';
import { CurriculumService } from '../../services/lms/curriculum';
import { ContentBlockService } from '../../services/lms/contentBlock';
import { LmsCourseService } from '../../services/lms/course';

// Helper: verify instructor/admin access to a course
async function verifyCourseAccess(userId: string, userRole: string, courseId: string) {
	if (userRole === 'admin') return;
	if (userRole !== 'instructor') throw new TRPCError({ code: 'FORBIDDEN' });
	const course = await LmsCourseService.getCourseById(courseId);
	if (!course || course.instructorId !== userId) {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own courses' });
	}
}

export const lmsCurriculumRouter = router({
	// Get full curriculum tree for a course
	getCurriculum: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.query(({ input }) => CurriculumService.getFullCurriculum(input.courseId)),

	// === MODULES ===
	getModules: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.query(({ input }) => CurriculumService.getModulesByCourse(input.courseId)),

	createModule: protectedProcedure
		.input(z.object({
			courseId: z.string(),
			title: z.string().min(1),
			slug: z.string().min(1),
			description: z.string().optional()
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			return CurriculumService.createModule(input);
		}),

	updateModule: protectedProcedure
		.input(z.object({
			moduleId: z.string(),
			title: z.string().min(1).optional(),
			slug: z.string().min(1).optional(),
			description: z.string().optional(),
			isPublished: z.boolean().optional()
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			const { moduleId, ...params } = input;
			return CurriculumService.updateModule(moduleId, params);
		}),

	deleteModule: protectedProcedure
		.input(z.object({ moduleId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			await CurriculumService.deleteModule(input.moduleId);
			return { success: true };
		}),

	reorderModules: protectedProcedure
		.input(z.object({
			courseId: z.string(),
			moduleIds: z.array(z.string())
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			await CurriculumService.reorderModules(input.courseId, input.moduleIds);
			return { success: true };
		}),

	// === LESSONS ===
	getLessons: protectedProcedure
		.input(z.object({ moduleId: z.string() }))
		.query(({ input }) => CurriculumService.getLessonsByModule(input.moduleId)),

	createLesson: protectedProcedure
		.input(z.object({
			moduleId: z.string(),
			title: z.string().min(1),
			slug: z.string().min(1),
			description: z.string().optional(),
			isPreview: z.boolean().default(false),
			estimatedMinutes: z.number().optional()
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			return CurriculumService.createLesson(input);
		}),

	updateLesson: protectedProcedure
		.input(z.object({
			lessonId: z.string(),
			title: z.string().min(1).optional(),
			slug: z.string().min(1).optional(),
			description: z.string().optional(),
			isPublished: z.boolean().optional(),
			isPreview: z.boolean().optional(),
			estimatedMinutes: z.number().optional()
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			const { lessonId, ...params } = input;
			return CurriculumService.updateLesson(lessonId, params);
		}),

	deleteLesson: protectedProcedure
		.input(z.object({ lessonId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			await CurriculumService.deleteLesson(input.lessonId);
			return { success: true };
		}),

	reorderLessons: protectedProcedure
		.input(z.object({
			moduleId: z.string(),
			lessonIds: z.array(z.string())
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			await CurriculumService.reorderLessons(input.moduleId, input.lessonIds);
			return { success: true };
		}),

	moveLesson: protectedProcedure
		.input(z.object({
			lessonId: z.string(),
			targetModuleId: z.string(),
			position: z.number().min(0)
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			await CurriculumService.moveLesson(input.lessonId, input.targetModuleId, input.position);
			return { success: true };
		}),

	// === CONTENT BLOCKS ===
	getContentBlocks: protectedProcedure
		.input(z.object({ lessonId: z.string() }))
		.query(({ input }) => ContentBlockService.getContentBlocksByLesson(input.lessonId)),

	createContentBlock: protectedProcedure
		.input(z.object({
			lessonId: z.string(),
			type: z.enum(['video', 'text', 'slides', 'download', 'audio', 'embed', 'code', 'image']),
			title: z.string().optional(),
			content: z.string().optional(),
			fileId: z.string().optional(),
			config: z.record(z.unknown()).optional(),
			isRequired: z.boolean().default(true),
			completionThreshold: z.number().min(0).max(100).default(100)
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			return ContentBlockService.createContentBlock(input);
		}),

	updateContentBlock: protectedProcedure
		.input(z.object({
			blockId: z.string(),
			type: z.enum(['video', 'text', 'slides', 'download', 'audio', 'embed', 'code', 'image']).optional(),
			title: z.string().optional(),
			content: z.string().optional(),
			fileId: z.string().optional(),
			config: z.record(z.unknown()).optional(),
			isRequired: z.boolean().optional(),
			completionThreshold: z.number().min(0).max(100).optional()
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			const { blockId, ...params } = input;
			return ContentBlockService.updateContentBlock(blockId, params);
		}),

	deleteContentBlock: protectedProcedure
		.input(z.object({ blockId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			await ContentBlockService.deleteContentBlock(input.blockId);
			return { success: true };
		}),

	reorderContentBlocks: protectedProcedure
		.input(z.object({
			lessonId: z.string(),
			blockIds: z.array(z.string())
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
			await ContentBlockService.reorderContentBlocks(input.lessonId, input.blockIds);
			return { success: true };
		})
});
