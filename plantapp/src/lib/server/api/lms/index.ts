import { router } from '../trpc';
import { lmsCourseRouter } from './course';
import { lmsCurriculumRouter } from './curriculum';
import { lmsEnrollmentRouter } from './enrollment';
import { progressRouter } from './progress';
import { analyticsRouter } from './analytics';
import { mediaRouter } from './media';
import { certificateRouter } from './certificate';
import { quizRouter } from './quiz';

export const lmsRouter = router({
	course: lmsCourseRouter,
	curriculum: lmsCurriculumRouter,
	enrollment: lmsEnrollmentRouter,
	progress: progressRouter,
	analytics: analyticsRouter,
	media: mediaRouter,
	certificate: certificateRouter,
	quiz: quizRouter
});

export type LmsRouter = typeof lmsRouter;
