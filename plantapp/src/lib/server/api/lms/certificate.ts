import { router, protectedProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { CertificateService } from '../../services/lms/certificate';
import { BadgeService } from '../../services/lms/badges';

export const certificateRouter = router({
  // Template CRUD (admin)
  createTemplate: protectedProcedure
    .input(z.object({ name: z.string(), htmlTemplate: z.string(), cssStyles: z.string().optional(), isDefault: z.boolean().optional(), courseId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Admin only');
      return CertificateService.createTemplate(input);
    }),

  updateTemplate: protectedProcedure
    .input(z.object({ templateId: z.string(), name: z.string().optional(), htmlTemplate: z.string().optional(), cssStyles: z.string().optional(), isDefault: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Admin only');
      const { templateId, ...data } = input;
      return CertificateService.updateTemplate(templateId, data);
    }),

  listTemplates: protectedProcedure
    .input(z.object({ courseId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'instructor') throw new Error('Unauthorized');
      return CertificateService.listTemplates(input.courseId);
    }),

  // Certificate access
  myCertificates: protectedProcedure.query(async ({ ctx }) => {
    return CertificateService.getUserCertificates(ctx.user.id);
  }),

  // Public verification
  verify: publicProcedure
    .input(z.object({ uid: z.string() }))
    .query(async ({ input }) => {
      return CertificateService.getCertificateByUid(input.uid);
    }),

  // Badges
  myBadges: protectedProcedure.query(async ({ ctx }) => {
    return BadgeService.getLearnerBadges(ctx.user.id);
  }),

  listBadges: protectedProcedure.query(async () => {
    return BadgeService.listBadges();
  }),

  createBadge: protectedProcedure
    .input(z.object({ name: z.string(), description: z.string().optional(), iconFileId: z.string().optional(), triggerType: z.string(), triggerConfig: z.record(z.any()).optional() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== 'admin') throw new Error('Admin only');
      return BadgeService.createBadge(input);
    })
});
