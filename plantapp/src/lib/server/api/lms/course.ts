import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { publicProcedure, protectedProcedure, adminProcedure, router } from '../trpc';
import { LmsCourseService } from '../../services/lms/course';
import { AuditLogService } from '../../services/auditLog';

export const lmsCourseRouter = router({
	// Public: list published courses with filters
	list: publicProcedure
		.input(z.object({
			courseType: z.enum(['self_paced', 'instructor_led', 'blended', 'cohort']).optional(),
			difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
			pricingType: z.enum(['free', 'one_time']).optional(),
			search: z.string().optional(),
			isFeatured: z.boolean().optional(),
			limit: z.number().min(1).max(50).default(20),
			offset: z.number().min(0).default(0),
			sortBy: z.enum(['title', 'createdAt', 'price']).default('createdAt'),
			sortOrder: z.enum(['asc', 'desc']).default('desc')
		}))
		.query(({ input }) => LmsCourseService.listCourses({ ...input, isAdmin: false })),

	// Public: get course by slug
	getBySlug: publicProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ input }) => {
			const course = await LmsCourseService.getCourseBySlug(input.slug);
			if (!course) throw new TRPCError({ code: 'NOT_FOUND', message: 'Course not found' });
			return course;
		}),

	// Admin/Instructor: create course
	create: protectedProcedure
		.input(z.object({
			title: z.string().min(1),
			slug: z.string().min(1),
			description: z.string().optional(),
			courseType: z.enum(['self_paced', 'instructor_led', 'blended', 'cohort']).default('self_paced'),
			instructorId: z.string().optional(),
			thumbnailFileId: z.string().optional(),
			difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
			language: z.string().default('en'),
			durationEstimate: z.number().optional(),
			price: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
			pricingType: z.enum(['free', 'one_time']).default('free'),
			enrollmentType: z.enum(['open', 'approval', 'invite', 'capacity']).default('open'),
			maxEnrollment: z.number().min(1).optional(),
			passingScore: z.number().min(0).max(100).default(70),
			programId: z.string().optional(),
			sequentialEnabled: z.boolean().default(true),
			isFeatured: z.boolean().default(false),
			metaTitle: z.string().optional(),
			metaDescription: z.string().optional()
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) {
				throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin or instructor access required' });
			}
			// If instructor, force instructorId to their own ID
			const params = ctx.user.role === 'instructor'
				? { ...input, instructorId: ctx.user.id }
				: input;
			const course = await LmsCourseService.createCourse(params);
			await AuditLogService.log(ctx.user.id, 'lms_create_course', { courseId: course.id, title: course.title });
			return course;
		}),

	// Admin/Instructor: update course
	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			title: z.string().min(1).optional(),
			slug: z.string().min(1).optional(),
			description: z.string().optional(),
			courseType: z.enum(['self_paced', 'instructor_led', 'blended', 'cohort']).optional(),
			instructorId: z.string().optional(),
			thumbnailFileId: z.string().optional(),
			difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
			language: z.string().optional(),
			durationEstimate: z.number().optional(),
			price: z.string().regex(/^\d+(\.\d{2})?$/).optional(),
			pricingType: z.enum(['free', 'one_time']).optional(),
			enrollmentType: z.enum(['open', 'approval', 'invite', 'capacity']).optional(),
			maxEnrollment: z.number().min(1).optional(),
			passingScore: z.number().min(0).max(100).optional(),
			programId: z.string().optional(),
			sequentialEnabled: z.boolean().optional(),
			isFeatured: z.boolean().optional(),
			metaTitle: z.string().optional(),
			metaDescription: z.string().optional()
		}))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) {
				throw new TRPCError({ code: 'FORBIDDEN' });
			}
			const { id, ...params } = input;
			// If instructor, verify they own this course
			if (ctx.user.role === 'instructor') {
				const course = await LmsCourseService.getCourseById(id);
				if (!course || course.instructorId !== ctx.user.id) {
					throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own courses' });
				}
			}
			const course = await LmsCourseService.updateCourse(id, params);
			await AuditLogService.log(ctx.user.id, 'lms_update_course', { courseId: id });
			return course;
		}),

	// Admin: delete (archive) course
	delete: adminProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await LmsCourseService.deleteCourse(input.id);
			await AuditLogService.log(ctx.user.id, 'lms_delete_course', { courseId: input.id });
			return { success: true };
		}),

	// Admin: clone course
	clone: adminProcedure
		.input(z.object({
			courseId: z.string(),
			newTitle: z.string().min(1),
			newSlug: z.string().min(1)
		}))
		.mutation(async ({ ctx, input }) => {
			const course = await LmsCourseService.cloneCourse(input.courseId, input.newTitle, input.newSlug);
			await AuditLogService.log(ctx.user.id, 'lms_clone_course', { sourceId: input.courseId, newId: course.id });
			return course;
		}),

	// Admin/Instructor: publish course
	publish: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			if (!['admin', 'instructor'].includes(ctx.user.role)) {
				throw new TRPCError({ code: 'FORBIDDEN' });
			}
			const course = await LmsCourseService.publishCourse(input.id);
			await AuditLogService.log(ctx.user.id, 'lms_publish_course', { courseId: input.id });
			return course;
		}),

	// Admin: list all courses (including draft/archived)
	adminList: adminProcedure
		.input(z.object({
			status: z.enum(['draft', 'published', 'archived']).optional(),
			search: z.string().optional(),
			instructorId: z.string().optional(),
			limit: z.number().min(1).max(100).default(50),
			offset: z.number().min(0).default(0),
			sortBy: z.enum(['title', 'createdAt', 'price']).default('createdAt'),
			sortOrder: z.enum(['asc', 'desc']).default('desc')
		}))
		.query(({ input }) => LmsCourseService.listCourses({ ...input, isAdmin: true }))
});
