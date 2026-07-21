-- Source-only LMS integrity migration. See drizzle/AGENTS.md before applying this to any database.
-- It is intentionally not journaled while the historical Drizzle baseline is unresolved.

BEGIN;
--> statement-breakpoint
DO $$
BEGIN
	IF to_regclass('public.lms_quiz_answer') IS NULL THEN
		RAISE EXCEPTION 'The LMS quiz-integrity migration requires the lms_quiz_answer table';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM pg_indexes
		WHERE schemaname = 'public' AND indexname = 'lms_quiz_answer_attempt_question_idx'
	) THEN
		RAISE EXCEPTION 'lms_quiz_answer_attempt_question_idx already exists; stop and reconcile the target-specific baseline';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM lms_quiz_answer
		GROUP BY attempt_id, question_id
		HAVING count(*) > 1
	) THEN
		RAISE EXCEPTION 'lms_quiz_answer contains duplicate attempt/question pairs; reconcile them before applying this migration';
	END IF;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX "lms_quiz_answer_attempt_question_idx" ON "lms_quiz_answer" USING btree ("attempt_id", "question_id");
--> statement-breakpoint
COMMIT;
