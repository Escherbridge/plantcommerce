import { z } from 'zod';
import { protectedProcedure, adminProcedure, router } from '../trpc';
import { EnrollmentService } from '../../services/lms/enrollment';
import { AuditLogService } from '../../services/auditLog';
import { LmsAccessService } from '../../services/lms/access';

export const lmsEnrollmentRouter = router({
	// Enroll in a free course
	enroll: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requirePublishedCourse(input.courseId);
			return EnrollmentService.enroll(ctx.user.id, input.courseId);
		}),

	// Request enrollment (approval-required courses)
	requestEnroll: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requirePublishedCourse(input.courseId);
			return EnrollmentService.requestEnrollment(ctx.user.id, input.courseId);
		}),

	// Admin/Instructor: approve enrollment
	approve: protectedProcedure
		.input(z.object({ enrollmentId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireEnrollmentManager(ctx.user, input.enrollmentId);
			const enrollment = await EnrollmentService.approveEnrollment(input.enrollmentId);
			await AuditLogService.log(ctx.user.id, 'lms_approve_enrollment', {
				enrollmentId: input.enrollmentId
			});
			return enrollment;
		}),

	// Admin/Instructor: reject enrollment
	reject: protectedProcedure
		.input(z.object({ enrollmentId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requireEnrollmentManager(ctx.user, input.enrollmentId);
			await EnrollmentService.rejectEnrollment(input.enrollmentId);
			await AuditLogService.log(ctx.user.id, 'lms_reject_enrollment', {
				enrollmentId: input.enrollmentId
			});
			return { success: true };
		}),

	// Admin: bulk enroll
	bulkEnroll: adminProcedure
		.input(
			z.object({
				userIds: z.array(z.string()),
				courseId: z.string()
			})
		)
		.mutation(async ({ ctx, input }) => {
			LmsAccessService.requireAdmin(ctx.user);
			const result = await EnrollmentService.bulkEnroll(input.userIds, input.courseId);
			await AuditLogService.log(ctx.user.id, 'lms_bulk_enroll', {
				courseId: input.courseId,
				enrolled: result.enrolled
			});
			return result;
		}),

	// Get my enrollments
	myEnrollments: protectedProcedure
		.input(
			z
				.object({
					status: z.enum(['active', 'completed', 'suspended', 'expired']).optional()
				})
				.optional()
		)
		.query(({ ctx, input }) => EnrollmentService.getUserEnrollments(ctx.user.id, input)),

	// Course managers: get enrollments for a course
	courseEnrollments: protectedProcedure
		.input(
			z.object({
				courseId: z.string(),
				status: z.enum(['active', 'completed', 'suspended', 'expired']).optional(),
				limit: z.number().min(1).max(100).default(50),
				offset: z.number().min(0).default(0)
			})
		)
		.query(async ({ ctx, input }) => {
			await LmsAccessService.requireCourseManager(ctx.user, input.courseId);
			return EnrollmentService.getCourseEnrollments(input.courseId, input);
		}),

	// Check enrollment status
	checkEnrollment: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.query(({ ctx, input }) => EnrollmentService.getEnrollment(ctx.user.id, input.courseId)),

	// Check capacity
	checkCapacity: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.query(async ({ input }) => {
			await LmsAccessService.requirePublishedCourse(input.courseId);
			return EnrollmentService.checkCapacity(input.courseId);
		}),

	// Initiate paid enrollment
	initiatePaid: protectedProcedure
		.input(z.object({ courseId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await LmsAccessService.requirePublishedCourse(input.courseId);
			return EnrollmentService.initiatePaidEnrollment(ctx.user.id, input.courseId);
		}),

	// Admin: suspend enrollment
	suspend: adminProcedure
		.input(z.object({ enrollmentId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			LmsAccessService.requireAdmin(ctx.user);
			const enrollment = await EnrollmentService.suspendEnrollment(input.enrollmentId);
			await AuditLogService.log(ctx.user.id, 'lms_suspend_enrollment', {
				enrollmentId: input.enrollmentId
			});
			return enrollment;
		})
});
