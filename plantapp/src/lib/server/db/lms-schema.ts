import {
	pgTable,
	text,
	timestamp,
	integer,
	boolean,
	decimal,
	index,
	uniqueIndex,
	primaryKey
} from 'drizzle-orm/pg-core';
import { user, file, productCategory } from './schema';

// ======= LMS ENUMS (inline text enums) =======

// ======= LMS TABLES =======

// 1. lmsProgram
export const lmsProgram = pgTable('lms_program', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	sortOrder: integer('sort_order').notNull().default(0),
	isPublished: boolean('is_published').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	slugIdx: index('lms_program_slug_idx').on(table.slug)
}));

// 2. lmsCourse
export const lmsCourse = pgTable('lms_course', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	courseType: text('course_type', { enum: ['self_paced', 'instructor_led', 'blended', 'cohort'] }).notNull().default('self_paced'),
	instructorId: text('instructor_id').references(() => user.id),
	thumbnailFileId: text('thumbnail_file_id').references(() => file.id),
	difficulty: text('difficulty', { enum: ['beginner', 'intermediate', 'advanced'] }),
	language: text('language').notNull().default('en'),
	durationEstimate: integer('duration_estimate'), // minutes
	price: decimal('price', { precision: 10, scale: 2 }),
	pricingType: text('pricing_type', { enum: ['free', 'one_time'] }).notNull().default('free'),
	enrollmentType: text('enrollment_type', { enum: ['open', 'approval', 'invite', 'capacity'] }).notNull().default('open'),
	maxEnrollment: integer('max_enrollment'),
	passingScore: integer('passing_score').notNull().default(70),
	status: text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
	version: integer('version').notNull().default(1),
	programId: text('program_id').references(() => lmsProgram.id),
	sortOrder: integer('sort_order').notNull().default(0),
	sequentialEnabled: boolean('sequential_enabled').notNull().default(true),
	isFeatured: boolean('is_featured').notNull().default(false),
	metaTitle: text('meta_title'),
	metaDescription: text('meta_description'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	slugIdx: index('lms_course_slug_idx').on(table.slug),
	statusIdx: index('lms_course_status_idx').on(table.status),
	instructorIdx: index('lms_course_instructor_idx').on(table.instructorId),
	programIdx: index('lms_course_program_idx').on(table.programId),
	statusFeaturedIdx: index('lms_course_status_featured_idx').on(table.status, table.isFeatured)
}));

// 3. lmsModule
export const lmsModule = pgTable('lms_module', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	courseId: text('course_id')
		.notNull()
		.references(() => lmsCourse.id, { onDelete: 'cascade' }),
	sortOrder: integer('sort_order').notNull().default(0),
	isPublished: boolean('is_published').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	courseIdx: index('lms_module_course_idx').on(table.courseId),
	courseOrderIdx: index('lms_module_course_order_idx').on(table.courseId, table.sortOrder)
}));

// 4. lmsLesson
export const lmsLesson = pgTable('lms_lesson', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	moduleId: text('module_id')
		.notNull()
		.references(() => lmsModule.id, { onDelete: 'cascade' }),
	sortOrder: integer('sort_order').notNull().default(0),
	isPublished: boolean('is_published').notNull().default(true),
	isPreview: boolean('is_preview').notNull().default(false),
	estimatedMinutes: integer('estimated_minutes'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	moduleIdx: index('lms_lesson_module_idx').on(table.moduleId),
	moduleOrderIdx: index('lms_lesson_module_order_idx').on(table.moduleId, table.sortOrder)
}));

// 5. lmsContentBlock
export const lmsContentBlock = pgTable('lms_content_block', {
	id: text('id').primaryKey(),
	lessonId: text('lesson_id')
		.notNull()
		.references(() => lmsLesson.id, { onDelete: 'cascade' }),
	type: text('type', { enum: ['video', 'text', 'slides', 'download', 'audio', 'embed', 'code', 'image'] }).notNull(),
	title: text('title'),
	content: text('content'), // rich text or config JSON
	fileId: text('file_id').references(() => file.id),
	config: text('config'), // JSON for type-specific settings
	sortOrder: integer('sort_order').notNull().default(0),
	isRequired: boolean('is_required').notNull().default(true),
	completionThreshold: integer('completion_threshold').notNull().default(100), // percentage
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	lessonIdx: index('lms_content_block_lesson_idx').on(table.lessonId),
	lessonOrderIdx: index('lms_content_block_lesson_order_idx').on(table.lessonId, table.sortOrder),
	typeIdx: index('lms_content_block_type_idx').on(table.type)
}));

// 6. lmsQuiz
export const lmsQuiz = pgTable('lms_quiz', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	lessonId: text('lesson_id').references(() => lmsLesson.id),
	moduleId: text('module_id').references(() => lmsModule.id),
	courseId: text('course_id')
		.notNull()
		.references(() => lmsCourse.id),
	timeLimit: integer('time_limit'), // seconds
	passingScore: integer('passing_score').notNull().default(70),
	maxAttempts: integer('max_attempts').notNull().default(3),
	randomizeQuestions: boolean('randomize_questions').notNull().default(false),
	questionCount: integer('question_count'), // null = all questions
	showCorrectAnswers: boolean('show_correct_answers').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	lessonIdx: index('lms_quiz_lesson_idx').on(table.lessonId),
	moduleIdx: index('lms_quiz_module_idx').on(table.moduleId),
	courseIdx: index('lms_quiz_course_idx').on(table.courseId)
}));

// 7. lmsQuestionBank
export const lmsQuestionBank = pgTable('lms_question_bank', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	courseId: text('course_id')
		.notNull()
		.references(() => lmsCourse.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	courseIdx: index('lms_question_bank_course_idx').on(table.courseId)
}));

// 8. lmsQuestion
export const lmsQuestion = pgTable('lms_question', {
	id: text('id').primaryKey(),
	type: text('type', { enum: ['multiple_choice', 'multi_select', 'true_false', 'fill_blank', 'matching', 'short_answer', 'essay', 'ordering'] }).notNull(),
	prompt: text('prompt').notNull(), // the question text
	explanation: text('explanation'), // shown after answering
	config: text('config'), // JSON for type-specific data like matching pairs
	bankId: text('bank_id')
		.notNull()
		.references(() => lmsQuestionBank.id, { onDelete: 'cascade' }),
	points: integer('points').notNull().default(1),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	bankIdx: index('lms_question_bank_idx').on(table.bankId),
	typeIdx: index('lms_question_type_idx').on(table.type)
}));

// 9. lmsQuestionOption
export const lmsQuestionOption = pgTable('lms_question_option', {
	id: text('id').primaryKey(),
	questionId: text('question_id')
		.notNull()
		.references(() => lmsQuestion.id, { onDelete: 'cascade' }),
	label: text('label').notNull(),
	isCorrect: boolean('is_correct').notNull().default(false),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	questionIdx: index('lms_question_option_question_idx').on(table.questionId)
}));

// 10. lmsEnrollment
export const lmsEnrollment = pgTable('lms_enrollment', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	courseId: text('course_id')
		.notNull()
		.references(() => lmsCourse.id),
	status: text('status', { enum: ['pending', 'active', 'completed', 'suspended', 'expired'] }).notNull().default('active'),
	enrolledAt: timestamp('enrolled_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }),
	stripePaymentId: text('stripe_payment_id'),
	lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true, mode: 'date' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('lms_enrollment_user_idx').on(table.userId),
	courseIdx: index('lms_enrollment_course_idx').on(table.courseId),
	statusIdx: index('lms_enrollment_status_idx').on(table.status),
	userCourseIdx: uniqueIndex('lms_enrollment_user_course_idx').on(table.userId, table.courseId)
}));

// 11. lmsProgress
export const lmsProgress = pgTable('lms_progress', {
	id: text('id').primaryKey(),
	enrollmentId: text('enrollment_id')
		.notNull()
		.references(() => lmsEnrollment.id, { onDelete: 'cascade' }),
	contentBlockId: text('content_block_id').references(() => lmsContentBlock.id),
	lessonId: text('lesson_id').references(() => lmsLesson.id),
	moduleId: text('module_id').references(() => lmsModule.id),
	status: text('status', { enum: ['not_started', 'in_progress', 'completed'] }).notNull().default('not_started'),
	progressPercent: integer('progress_percent').notNull().default(0),
	metadata: text('metadata'), // JSON: videoTime, scrollPercent, etc.
	completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	enrollmentIdx: index('lms_progress_enrollment_idx').on(table.enrollmentId),
	enrollmentContentIdx: index('lms_progress_enrollment_content_idx').on(table.enrollmentId, table.contentBlockId),
	enrollmentLessonIdx: index('lms_progress_enrollment_lesson_idx').on(table.enrollmentId, table.lessonId),
	enrollmentContentUniqueIdx: uniqueIndex('lms_progress_enrollment_content_unique_idx').on(table.enrollmentId, table.contentBlockId)
}));

// 12. lmsQuizAttempt
export const lmsQuizAttempt = pgTable('lms_quiz_attempt', {
	id: text('id').primaryKey(),
	quizId: text('quiz_id')
		.notNull()
		.references(() => lmsQuiz.id, { onDelete: 'cascade' }),
	enrollmentId: text('enrollment_id')
		.notNull()
		.references(() => lmsEnrollment.id, { onDelete: 'cascade' }),
	startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	submittedAt: timestamp('submitted_at', { withTimezone: true, mode: 'date' }),
	score: integer('score'),
	totalPoints: integer('total_points'),
	passed: boolean('passed'),
	timeSpent: integer('time_spent'), // seconds
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	quizIdx: index('lms_quiz_attempt_quiz_idx').on(table.quizId),
	enrollmentIdx: index('lms_quiz_attempt_enrollment_idx').on(table.enrollmentId),
	quizEnrollmentIdx: index('lms_quiz_attempt_quiz_enrollment_idx').on(table.quizId, table.enrollmentId)
}));

// 13. lmsQuizAnswer
export const lmsQuizAnswer = pgTable('lms_quiz_answer', {
	id: text('id').primaryKey(),
	attemptId: text('attempt_id')
		.notNull()
		.references(() => lmsQuizAttempt.id, { onDelete: 'cascade' }),
	questionId: text('question_id')
		.notNull()
		.references(() => lmsQuestion.id),
	answer: text('answer').notNull(), // JSON
	isCorrect: boolean('is_correct'),
	pointsAwarded: integer('points_awarded').notNull().default(0),
	gradedBy: text('graded_by').references(() => user.id), // for manual grading
	gradedAt: timestamp('graded_at', { withTimezone: true, mode: 'date' }),
	feedback: text('feedback'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	attemptIdx: index('lms_quiz_answer_attempt_idx').on(table.attemptId),
	questionIdx: index('lms_quiz_answer_question_idx').on(table.questionId),
	attemptQuestionIdx: uniqueIndex('lms_quiz_answer_attempt_question_idx').on(table.attemptId, table.questionId)
}));

// 14. lmsCertificateTemplate
export const lmsCertificateTemplate = pgTable('lms_certificate_template', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	htmlTemplate: text('html_template').notNull(),
	cssStyles: text('css_styles').notNull(),
	isDefault: boolean('is_default').notNull().default(false),
	courseId: text('course_id').references(() => lmsCourse.id), // null = global template
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	courseIdx: index('lms_certificate_template_course_idx').on(table.courseId)
}));

// 15. lmsCertificate
export const lmsCertificate = pgTable('lms_certificate', {
	id: text('id').primaryKey(),
	enrollmentId: text('enrollment_id')
		.notNull()
		.references(() => lmsEnrollment.id),
	templateId: text('template_id')
		.notNull()
		.references(() => lmsCertificateTemplate.id),
	certificateUid: text('certificate_uid').notNull().unique(), // short unique ID for verification
	issuedAt: timestamp('issued_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	metadata: text('metadata'), // JSON
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	enrollmentIdx: index('lms_certificate_enrollment_idx').on(table.enrollmentId),
	uidIdx: index('lms_certificate_uid_idx').on(table.certificateUid)
}));

// 16. lmsBadge
export const lmsBadge = pgTable('lms_badge', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	iconFileId: text('icon_file_id').references(() => file.id),
	triggerType: text('trigger_type').notNull(), // 'course_complete', 'quiz_perfect', 'streak', 'custom'
	triggerConfig: text('trigger_config'), // JSON
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	triggerTypeIdx: index('lms_badge_trigger_type_idx').on(table.triggerType)
}));

// 17. lmsLearnerBadge
export const lmsLearnerBadge = pgTable('lms_learner_badge', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	badgeId: text('badge_id')
		.notNull()
		.references(() => lmsBadge.id),
	earnedAt: timestamp('earned_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('lms_learner_badge_user_idx').on(table.userId),
	badgeIdx: index('lms_learner_badge_badge_idx').on(table.badgeId),
	userBadgeIdx: uniqueIndex('lms_learner_badge_user_badge_idx').on(table.userId, table.badgeId)
}));

// 18. lmsDiscussionThread
export const lmsDiscussionThread = pgTable('lms_discussion_thread', {
	id: text('id').primaryKey(),
	courseId: text('course_id')
		.notNull()
		.references(() => lmsCourse.id, { onDelete: 'cascade' }),
	lessonId: text('lesson_id').references(() => lmsLesson.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	title: text('title').notNull(),
	body: text('body').notNull(),
	isPinned: boolean('is_pinned').notNull().default(false),
	isLocked: boolean('is_locked').notNull().default(false),
	replyCount: integer('reply_count').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	courseIdx: index('lms_discussion_thread_course_idx').on(table.courseId),
	lessonIdx: index('lms_discussion_thread_lesson_idx').on(table.lessonId),
	userIdx: index('lms_discussion_thread_user_idx').on(table.userId),
	coursePinnedIdx: index('lms_discussion_thread_course_pinned_idx').on(table.courseId, table.isPinned)
}));

// 19. lmsDiscussionReply
export const lmsDiscussionReply = pgTable('lms_discussion_reply', {
	id: text('id').primaryKey(),
	threadId: text('thread_id')
		.notNull()
		.references(() => lmsDiscussionThread.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	parentReplyId: text('parent_reply_id'), // self-reference for nesting
	body: text('body').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	threadIdx: index('lms_discussion_reply_thread_idx').on(table.threadId),
	userIdx: index('lms_discussion_reply_user_idx').on(table.userId),
	parentIdx: index('lms_discussion_reply_parent_idx').on(table.parentReplyId)
}));

// 20. lmsCourseReview
export const lmsCourseReview = pgTable('lms_course_review', {
	id: text('id').primaryKey(),
	courseId: text('course_id')
		.notNull()
		.references(() => lmsCourse.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	rating: integer('rating').notNull(), // 1-5
	reviewText: text('review_text'),
	status: text('status', { enum: ['pending', 'approved', 'rejected'] }).notNull().default('pending'),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	courseIdx: index('lms_course_review_course_idx').on(table.courseId),
	userIdx: index('lms_course_review_user_idx').on(table.userId),
	statusIdx: index('lms_course_review_status_idx').on(table.status),
	courseUserIdx: uniqueIndex('lms_course_review_course_user_idx').on(table.courseId, table.userId)
}));

// 21. lmsCourseCategory
export const lmsCourseCategory = pgTable('lms_course_category', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	sortOrder: integer('sort_order').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	slugIdx: index('lms_course_category_slug_idx').on(table.slug)
}));

// 22. lmsCourseTag
export const lmsCourseTag = pgTable('lms_course_tag', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	slugIdx: index('lms_course_tag_slug_idx').on(table.slug)
}));

// 23. lmsCourseToCategoryJoin (join table)
export const lmsCourseToCategoryJoin = pgTable('lms_course_to_category', {
	courseId: text('course_id')
		.notNull()
		.references(() => lmsCourse.id, { onDelete: 'cascade' }),
	categoryId: text('category_id')
		.notNull()
		.references(() => lmsCourseCategory.id, { onDelete: 'cascade' })
}, (table) => ({
	pk: primaryKey({ columns: [table.courseId, table.categoryId] })
}));

// 24. lmsCourseToTagJoin (join table)
export const lmsCourseToTagJoin = pgTable('lms_course_to_tag', {
	courseId: text('course_id')
		.notNull()
		.references(() => lmsCourse.id, { onDelete: 'cascade' }),
	tagId: text('tag_id')
		.notNull()
		.references(() => lmsCourseTag.id, { onDelete: 'cascade' })
}, (table) => ({
	pk: primaryKey({ columns: [table.courseId, table.tagId] })
}));

// 25. lmsCourseProduct (link courses to product categories)
export const lmsCourseProduct = pgTable('lms_course_product', {
	id: text('id').primaryKey(),
	courseId: text('course_id')
		.notNull()
		.references(() => lmsCourse.id, { onDelete: 'cascade' }),
	productCategoryId: integer('product_category_id')
		.notNull()
		.references(() => productCategory.id),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	courseIdx: index('lms_course_product_course_idx').on(table.courseId),
	categoryIdx: index('lms_course_product_category_idx').on(table.productCategoryId),
	courseProductIdx: uniqueIndex('lms_course_product_unique_idx').on(table.courseId, table.productCategoryId)
}));

// 26. lmsCoursePrerequisite
export const lmsCoursePrerequisite = pgTable('lms_course_prerequisite', {
	courseId: text('course_id')
		.notNull()
		.references(() => lmsCourse.id, { onDelete: 'cascade' }),
	prerequisiteCourseId: text('prerequisite_course_id')
		.notNull()
		.references(() => lmsCourse.id, { onDelete: 'cascade' })
}, (table) => ({
	pk: primaryKey({ columns: [table.courseId, table.prerequisiteCourseId] })
}));

// 27. lmsBookmark
export const lmsBookmark = pgTable('lms_bookmark', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	lessonId: text('lesson_id')
		.notNull()
		.references(() => lmsLesson.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('lms_bookmark_user_idx').on(table.userId),
	userLessonIdx: uniqueIndex('lms_bookmark_user_lesson_idx').on(table.userId, table.lessonId)
}));

// 28. lmsNote
export const lmsNote = pgTable('lms_note', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	lessonId: text('lesson_id')
		.notNull()
		.references(() => lmsLesson.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('lms_note_user_idx').on(table.userId),
	userLessonIdx: index('lms_note_user_lesson_idx').on(table.userId, table.lessonId)
}));

// ======= INFERRED TYPES =======
export type LmsProgram = typeof lmsProgram.$inferSelect;
export type LmsCourse = typeof lmsCourse.$inferSelect;
export type LmsModule = typeof lmsModule.$inferSelect;
export type LmsLesson = typeof lmsLesson.$inferSelect;
export type LmsContentBlock = typeof lmsContentBlock.$inferSelect;
export type LmsQuiz = typeof lmsQuiz.$inferSelect;
export type LmsQuestionBank = typeof lmsQuestionBank.$inferSelect;
export type LmsQuestion = typeof lmsQuestion.$inferSelect;
export type LmsQuestionOption = typeof lmsQuestionOption.$inferSelect;
export type LmsEnrollment = typeof lmsEnrollment.$inferSelect;
export type LmsProgress = typeof lmsProgress.$inferSelect;
export type LmsQuizAttempt = typeof lmsQuizAttempt.$inferSelect;
export type LmsQuizAnswer = typeof lmsQuizAnswer.$inferSelect;
export type LmsCertificateTemplate = typeof lmsCertificateTemplate.$inferSelect;
export type LmsCertificate = typeof lmsCertificate.$inferSelect;
export type LmsBadge = typeof lmsBadge.$inferSelect;
export type LmsLearnerBadge = typeof lmsLearnerBadge.$inferSelect;
export type LmsDiscussionThread = typeof lmsDiscussionThread.$inferSelect;
export type LmsDiscussionReply = typeof lmsDiscussionReply.$inferSelect;
export type LmsCourseReview = typeof lmsCourseReview.$inferSelect;
export type LmsCourseCategory = typeof lmsCourseCategory.$inferSelect;
export type LmsCourseTag = typeof lmsCourseTag.$inferSelect;
export type LmsCourseToCategoryJoin = typeof lmsCourseToCategoryJoin.$inferSelect;
export type LmsCourseToTagJoin = typeof lmsCourseToTagJoin.$inferSelect;
export type LmsCourseProduct = typeof lmsCourseProduct.$inferSelect;
export type LmsCoursePrerequisite = typeof lmsCoursePrerequisite.$inferSelect;
export type LmsBookmark = typeof lmsBookmark.$inferSelect;
export type LmsNote = typeof lmsNote.$inferSelect;

// Insert types
export type NewLmsProgram = typeof lmsProgram.$inferInsert;
export type NewLmsCourse = typeof lmsCourse.$inferInsert;
export type NewLmsModule = typeof lmsModule.$inferInsert;
export type NewLmsLesson = typeof lmsLesson.$inferInsert;
export type NewLmsContentBlock = typeof lmsContentBlock.$inferInsert;
export type NewLmsQuiz = typeof lmsQuiz.$inferInsert;
export type NewLmsQuestionBank = typeof lmsQuestionBank.$inferInsert;
export type NewLmsQuestion = typeof lmsQuestion.$inferInsert;
export type NewLmsQuestionOption = typeof lmsQuestionOption.$inferInsert;
export type NewLmsEnrollment = typeof lmsEnrollment.$inferInsert;
export type NewLmsProgress = typeof lmsProgress.$inferInsert;
export type NewLmsQuizAttempt = typeof lmsQuizAttempt.$inferInsert;
export type NewLmsQuizAnswer = typeof lmsQuizAnswer.$inferInsert;
export type NewLmsCertificateTemplate = typeof lmsCertificateTemplate.$inferInsert;
export type NewLmsCertificate = typeof lmsCertificate.$inferInsert;
export type NewLmsBadge = typeof lmsBadge.$inferInsert;
export type NewLmsLearnerBadge = typeof lmsLearnerBadge.$inferInsert;
export type NewLmsDiscussionThread = typeof lmsDiscussionThread.$inferInsert;
export type NewLmsDiscussionReply = typeof lmsDiscussionReply.$inferInsert;
export type NewLmsCourseReview = typeof lmsCourseReview.$inferInsert;
export type NewLmsCourseCategory = typeof lmsCourseCategory.$inferInsert;
export type NewLmsCourseTag = typeof lmsCourseTag.$inferInsert;
export type NewLmsCourseProduct = typeof lmsCourseProduct.$inferInsert;
export type NewLmsBookmark = typeof lmsBookmark.$inferInsert;
export type NewLmsNote = typeof lmsNote.$inferInsert;
