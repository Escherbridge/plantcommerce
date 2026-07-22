import { relations } from 'drizzle-orm';
import { user, file, productCategory } from './schema';
import {
	lmsProgram,
	lmsCourse,
	lmsModule,
	lmsLesson,
	lmsContentBlock,
	lmsQuiz,
	lmsQuestionBank,
	lmsQuestion,
	lmsQuestionOption,
	lmsEnrollment,
	lmsProgress,
	lmsQuizAttempt,
	lmsQuizAnswer,
	lmsCertificateTemplate,
	lmsCertificate,
	lmsBadge,
	lmsLearnerBadge,
	lmsDiscussionThread,
	lmsDiscussionReply,
	lmsCourseReview,
	lmsCourseCategory,
	lmsCourseTag,
	lmsCourseToCategoryJoin,
	lmsCourseToTagJoin,
	lmsCourseProduct,
	lmsCoursePrerequisite,
	lmsBookmark,
	lmsNote
} from './lms-schema';

// ======= LMS RELATIONS =======

export const lmsProgramRelations = relations(lmsProgram, ({ many }) => ({
	courses: many(lmsCourse)
}));

export const lmsCourseRelations = relations(lmsCourse, ({ one, many }) => ({
	program: one(lmsProgram, {
		fields: [lmsCourse.programId],
		references: [lmsProgram.id]
	}),
	instructor: one(user, {
		fields: [lmsCourse.instructorId],
		references: [user.id]
	}),
	thumbnailFile: one(file, {
		fields: [lmsCourse.thumbnailFileId],
		references: [file.id],
		relationName: 'lms_course_thumbnail'
	}),
	modules: many(lmsModule),
	quizzes: many(lmsQuiz),
	enrollments: many(lmsEnrollment),
	questionBanks: many(lmsQuestionBank),
	certificateTemplates: many(lmsCertificateTemplate),
	discussionThreads: many(lmsDiscussionThread),
	reviews: many(lmsCourseReview),
	courseProducts: many(lmsCourseProduct),
	prerequisites: many(lmsCoursePrerequisite, { relationName: 'lms_prerequisite_course' }),
	prerequisiteOf: many(lmsCoursePrerequisite, { relationName: 'lms_prerequisite_required' }),
	categoryJoins: many(lmsCourseToCategoryJoin),
	tagJoins: many(lmsCourseToTagJoin)
}));

export const lmsModuleRelations = relations(lmsModule, ({ one, many }) => ({
	course: one(lmsCourse, {
		fields: [lmsModule.courseId],
		references: [lmsCourse.id]
	}),
	lessons: many(lmsLesson),
	quizzes: many(lmsQuiz),
	progress: many(lmsProgress)
}));

export const lmsLessonRelations = relations(lmsLesson, ({ one, many }) => ({
	module: one(lmsModule, {
		fields: [lmsLesson.moduleId],
		references: [lmsModule.id]
	}),
	contentBlocks: many(lmsContentBlock),
	quizzes: many(lmsQuiz),
	progress: many(lmsProgress),
	discussionThreads: many(lmsDiscussionThread),
	bookmarks: many(lmsBookmark),
	notes: many(lmsNote)
}));

export const lmsContentBlockRelations = relations(lmsContentBlock, ({ one, many }) => ({
	lesson: one(lmsLesson, {
		fields: [lmsContentBlock.lessonId],
		references: [lmsLesson.id]
	}),
	file: one(file, {
		fields: [lmsContentBlock.fileId],
		references: [file.id],
		relationName: 'lms_content_block_file'
	}),
	progress: many(lmsProgress)
}));

export const lmsQuizRelations = relations(lmsQuiz, ({ one, many }) => ({
	course: one(lmsCourse, {
		fields: [lmsQuiz.courseId],
		references: [lmsCourse.id]
	}),
	lesson: one(lmsLesson, {
		fields: [lmsQuiz.lessonId],
		references: [lmsLesson.id]
	}),
	module: one(lmsModule, {
		fields: [lmsQuiz.moduleId],
		references: [lmsModule.id]
	}),
	attempts: many(lmsQuizAttempt)
}));

export const lmsQuestionBankRelations = relations(lmsQuestionBank, ({ one, many }) => ({
	course: one(lmsCourse, {
		fields: [lmsQuestionBank.courseId],
		references: [lmsCourse.id]
	}),
	questions: many(lmsQuestion)
}));

export const lmsQuestionRelations = relations(lmsQuestion, ({ one, many }) => ({
	bank: one(lmsQuestionBank, {
		fields: [lmsQuestion.bankId],
		references: [lmsQuestionBank.id]
	}),
	options: many(lmsQuestionOption),
	answers: many(lmsQuizAnswer)
}));

export const lmsQuestionOptionRelations = relations(lmsQuestionOption, ({ one }) => ({
	question: one(lmsQuestion, {
		fields: [lmsQuestionOption.questionId],
		references: [lmsQuestion.id]
	})
}));

export const lmsEnrollmentRelations = relations(lmsEnrollment, ({ one, many }) => ({
	user: one(user, {
		fields: [lmsEnrollment.userId],
		references: [user.id]
	}),
	course: one(lmsCourse, {
		fields: [lmsEnrollment.courseId],
		references: [lmsCourse.id]
	}),
	progress: many(lmsProgress),
	quizAttempts: many(lmsQuizAttempt),
	certificates: many(lmsCertificate)
}));

export const lmsProgressRelations = relations(lmsProgress, ({ one }) => ({
	enrollment: one(lmsEnrollment, {
		fields: [lmsProgress.enrollmentId],
		references: [lmsEnrollment.id]
	}),
	contentBlock: one(lmsContentBlock, {
		fields: [lmsProgress.contentBlockId],
		references: [lmsContentBlock.id]
	}),
	lesson: one(lmsLesson, {
		fields: [lmsProgress.lessonId],
		references: [lmsLesson.id]
	}),
	module: one(lmsModule, {
		fields: [lmsProgress.moduleId],
		references: [lmsModule.id]
	})
}));

export const lmsQuizAttemptRelations = relations(lmsQuizAttempt, ({ one, many }) => ({
	quiz: one(lmsQuiz, {
		fields: [lmsQuizAttempt.quizId],
		references: [lmsQuiz.id]
	}),
	enrollment: one(lmsEnrollment, {
		fields: [lmsQuizAttempt.enrollmentId],
		references: [lmsEnrollment.id]
	}),
	answers: many(lmsQuizAnswer)
}));

export const lmsQuizAnswerRelations = relations(lmsQuizAnswer, ({ one }) => ({
	attempt: one(lmsQuizAttempt, {
		fields: [lmsQuizAnswer.attemptId],
		references: [lmsQuizAttempt.id]
	}),
	question: one(lmsQuestion, {
		fields: [lmsQuizAnswer.questionId],
		references: [lmsQuestion.id]
	}),
	gradedByUser: one(user, {
		fields: [lmsQuizAnswer.gradedBy],
		references: [user.id],
		relationName: 'lms_quiz_answer_grader'
	})
}));

export const lmsCertificateTemplateRelations = relations(
	lmsCertificateTemplate,
	({ one, many }) => ({
		course: one(lmsCourse, {
			fields: [lmsCertificateTemplate.courseId],
			references: [lmsCourse.id]
		}),
		certificates: many(lmsCertificate)
	})
);

export const lmsCertificateRelations = relations(lmsCertificate, ({ one }) => ({
	enrollment: one(lmsEnrollment, {
		fields: [lmsCertificate.enrollmentId],
		references: [lmsEnrollment.id]
	}),
	template: one(lmsCertificateTemplate, {
		fields: [lmsCertificate.templateId],
		references: [lmsCertificateTemplate.id]
	})
}));

export const lmsBadgeRelations = relations(lmsBadge, ({ one, many }) => ({
	iconFile: one(file, {
		fields: [lmsBadge.iconFileId],
		references: [file.id],
		relationName: 'lms_badge_icon'
	}),
	learnerBadges: many(lmsLearnerBadge)
}));

export const lmsLearnerBadgeRelations = relations(lmsLearnerBadge, ({ one }) => ({
	user: one(user, {
		fields: [lmsLearnerBadge.userId],
		references: [user.id]
	}),
	badge: one(lmsBadge, {
		fields: [lmsLearnerBadge.badgeId],
		references: [lmsBadge.id]
	})
}));

export const lmsDiscussionThreadRelations = relations(lmsDiscussionThread, ({ one, many }) => ({
	course: one(lmsCourse, {
		fields: [lmsDiscussionThread.courseId],
		references: [lmsCourse.id]
	}),
	lesson: one(lmsLesson, {
		fields: [lmsDiscussionThread.lessonId],
		references: [lmsLesson.id]
	}),
	user: one(user, {
		fields: [lmsDiscussionThread.userId],
		references: [user.id]
	}),
	replies: many(lmsDiscussionReply)
}));

export const lmsDiscussionReplyRelations = relations(lmsDiscussionReply, ({ one, many }) => ({
	thread: one(lmsDiscussionThread, {
		fields: [lmsDiscussionReply.threadId],
		references: [lmsDiscussionThread.id]
	}),
	user: one(user, {
		fields: [lmsDiscussionReply.userId],
		references: [user.id]
	}),
	parentReply: one(lmsDiscussionReply, {
		fields: [lmsDiscussionReply.parentReplyId],
		references: [lmsDiscussionReply.id],
		relationName: 'lms_reply_nesting'
	}),
	childReplies: many(lmsDiscussionReply, {
		relationName: 'lms_reply_nesting'
	})
}));

export const lmsCourseReviewRelations = relations(lmsCourseReview, ({ one }) => ({
	course: one(lmsCourse, {
		fields: [lmsCourseReview.courseId],
		references: [lmsCourse.id]
	}),
	user: one(user, {
		fields: [lmsCourseReview.userId],
		references: [user.id]
	})
}));

export const lmsCourseCategoryRelations = relations(lmsCourseCategory, ({ many }) => ({
	courseJoins: many(lmsCourseToCategoryJoin)
}));

export const lmsCourseTagRelations = relations(lmsCourseTag, ({ many }) => ({
	courseJoins: many(lmsCourseToTagJoin)
}));

export const lmsCourseToCategoryJoinRelations = relations(lmsCourseToCategoryJoin, ({ one }) => ({
	course: one(lmsCourse, {
		fields: [lmsCourseToCategoryJoin.courseId],
		references: [lmsCourse.id]
	}),
	category: one(lmsCourseCategory, {
		fields: [lmsCourseToCategoryJoin.categoryId],
		references: [lmsCourseCategory.id]
	})
}));

export const lmsCourseToTagJoinRelations = relations(lmsCourseToTagJoin, ({ one }) => ({
	course: one(lmsCourse, {
		fields: [lmsCourseToTagJoin.courseId],
		references: [lmsCourse.id]
	}),
	tag: one(lmsCourseTag, {
		fields: [lmsCourseToTagJoin.tagId],
		references: [lmsCourseTag.id]
	})
}));

export const lmsCourseProductRelations = relations(lmsCourseProduct, ({ one }) => ({
	course: one(lmsCourse, {
		fields: [lmsCourseProduct.courseId],
		references: [lmsCourse.id]
	}),
	productCategory: one(productCategory, {
		fields: [lmsCourseProduct.productCategoryId],
		references: [productCategory.id]
	})
}));

export const lmsCoursePrerequisiteRelations = relations(lmsCoursePrerequisite, ({ one }) => ({
	course: one(lmsCourse, {
		fields: [lmsCoursePrerequisite.courseId],
		references: [lmsCourse.id],
		relationName: 'lms_prerequisite_course'
	}),
	prerequisiteCourse: one(lmsCourse, {
		fields: [lmsCoursePrerequisite.prerequisiteCourseId],
		references: [lmsCourse.id],
		relationName: 'lms_prerequisite_required'
	})
}));

export const lmsBookmarkRelations = relations(lmsBookmark, ({ one }) => ({
	user: one(user, {
		fields: [lmsBookmark.userId],
		references: [user.id]
	}),
	lesson: one(lmsLesson, {
		fields: [lmsBookmark.lessonId],
		references: [lmsLesson.id]
	})
}));

export const lmsNoteRelations = relations(lmsNote, ({ one }) => ({
	user: one(user, {
		fields: [lmsNote.userId],
		references: [user.id]
	}),
	lesson: one(lmsLesson, {
		fields: [lmsNote.lessonId],
		references: [lmsLesson.id]
	})
}));
