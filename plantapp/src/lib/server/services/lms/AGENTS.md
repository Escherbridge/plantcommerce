# LMS services

## Access boundaries

`access.ts` is the API-layer authorization gate for LMS resources. It resolves every mutable or private resource back to its source-schema course, then permits either an administrator, the course-owning instructor, or a learner with an `active`, non-expired enrollment in a published course. Quiz attempts additionally verify the attempt's enrollment owner and that the attempt, enrollment, quiz, question, and course relationship is internally consistent.

Call the closest resource-specific guard before calling an LMS service. Do not accept a client-supplied course, enrollment, module, lesson, bank, attempt, or file identifier as proof of ownership. Learners may stream LMS media only when it is referenced by a content block in a published lesson and module. LMS media uses the `file.entityType = 'lms'` association and fails closed for any other file relationship.

## Quiz contract

Quiz attempts are tied to an enrollment and the service persists one placeholder
answer per server-selected question before returning the attempt. Submission may
only update that stored set. The source schema declares the LMS file entity type
and an `(attempt_id, question_id)` uniqueness invariant; release of the latter
still requires the source-only `0005_lms_quiz_integrity.sql` rehearsal. For
manually graded questions, a submitted answer with `isCorrect = null` is
pending; `pointsAwarded = 0` is only the initial numeric value, not a grading
status.
