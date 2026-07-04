CREATE TABLE "cms_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"excerpt" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"author_id" text,
	"seo_fields_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "cms_content_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cms_seo_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" text NOT NULL,
	"page_type" text DEFAULT 'page' NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"og_title" text,
	"og_description" text,
	"og_image" text,
	"robots" text DEFAULT 'index, follow',
	"canonical_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_seo_fields_page_id_unique" UNIQUE("page_id")
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"product_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_badge" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon_file_id" text,
	"trigger_type" text NOT NULL,
	"trigger_config" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_bookmark" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_certificate" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"template_id" text NOT NULL,
	"certificate_uid" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_certificate_certificate_uid_unique" UNIQUE("certificate_uid")
);
--> statement-breakpoint
CREATE TABLE "lms_certificate_template" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"html_template" text NOT NULL,
	"css_styles" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"course_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_content_block" (
	"id" text PRIMARY KEY NOT NULL,
	"lesson_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text,
	"content" text,
	"file_id" text,
	"config" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"completion_threshold" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_course" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"course_type" text DEFAULT 'self_paced' NOT NULL,
	"instructor_id" text,
	"thumbnail_file_id" text,
	"difficulty" text,
	"language" text DEFAULT 'en' NOT NULL,
	"duration_estimate" integer,
	"price" numeric(10, 2),
	"pricing_type" text DEFAULT 'free' NOT NULL,
	"enrollment_type" text DEFAULT 'open' NOT NULL,
	"max_enrollment" integer,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"program_id" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"sequential_enabled" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_course_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lms_course_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_course_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lms_course_prerequisite" (
	"course_id" text NOT NULL,
	"prerequisite_course_id" text NOT NULL,
	CONSTRAINT "lms_course_prerequisite_course_id_prerequisite_course_id_pk" PRIMARY KEY("course_id","prerequisite_course_id")
);
--> statement-breakpoint
CREATE TABLE "lms_course_product" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"product_category_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_course_review" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"review_text" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_course_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_course_tag_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lms_course_to_category" (
	"course_id" text NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "lms_course_to_category_course_id_category_id_pk" PRIMARY KEY("course_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "lms_course_to_tag" (
	"course_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "lms_course_to_tag_course_id_tag_id_pk" PRIMARY KEY("course_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "lms_discussion_reply" (
	"id" text PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"user_id" text NOT NULL,
	"parent_reply_id" text,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_discussion_thread" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"lesson_id" text,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"course_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"enrolled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"stripe_payment_id" text,
	"last_accessed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_learner_badge" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_lesson" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"module_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"is_preview" boolean DEFAULT false NOT NULL,
	"estimated_minutes" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_lesson_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lms_module" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"course_id" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_module_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lms_note" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_program" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lms_program_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lms_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"content_block_id" text,
	"lesson_id" text,
	"module_id" text,
	"status" text DEFAULT 'not_started' NOT NULL,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"metadata" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_question" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"prompt" text NOT NULL,
	"explanation" text,
	"config" text,
	"bank_id" text NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_question_bank" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"course_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_question_option" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"label" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_quiz" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"lesson_id" text,
	"module_id" text,
	"course_id" text NOT NULL,
	"time_limit" integer,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	"randomize_questions" boolean DEFAULT false NOT NULL,
	"question_count" integer,
	"show_correct_answers" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_quiz_answer" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"question_id" text NOT NULL,
	"answer" text NOT NULL,
	"is_correct" boolean,
	"points_awarded" integer DEFAULT 0 NOT NULL,
	"graded_by" text,
	"graded_at" timestamp with time zone,
	"feedback" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms_quiz_attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"enrollment_id" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	"score" integer,
	"total_points" integer,
	"passed" boolean,
	"time_spent" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file" ALTER COLUMN "bucket_name" SET DEFAULT 'aevani-assets';--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "website" text;--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "social_media" text;--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "audience" text;--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "promotion_method" text;--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "monthly_traffic" text;--> statement-breakpoint
ALTER TABLE "affiliate" ADD COLUMN "why_join" text;--> statement-breakpoint
ALTER TABLE "cms_content" ADD CONSTRAINT "cms_content_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_content" ADD CONSTRAINT "cms_content_seo_fields_id_cms_seo_fields_id_fk" FOREIGN KEY ("seo_fields_id") REFERENCES "public"."cms_seo_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_item" ADD CONSTRAINT "wishlist_item_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_badge" ADD CONSTRAINT "lms_badge_icon_file_id_file_id_fk" FOREIGN KEY ("icon_file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_bookmark" ADD CONSTRAINT "lms_bookmark_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_bookmark" ADD CONSTRAINT "lms_bookmark_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_certificate" ADD CONSTRAINT "lms_certificate_enrollment_id_lms_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."lms_enrollment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_certificate" ADD CONSTRAINT "lms_certificate_template_id_lms_certificate_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."lms_certificate_template"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_certificate_template" ADD CONSTRAINT "lms_certificate_template_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_content_block" ADD CONSTRAINT "lms_content_block_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_content_block" ADD CONSTRAINT "lms_content_block_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course" ADD CONSTRAINT "lms_course_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course" ADD CONSTRAINT "lms_course_thumbnail_file_id_file_id_fk" FOREIGN KEY ("thumbnail_file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course" ADD CONSTRAINT "lms_course_program_id_lms_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."lms_program"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course_prerequisite" ADD CONSTRAINT "lms_course_prerequisite_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course_prerequisite" ADD CONSTRAINT "lms_course_prerequisite_prerequisite_course_id_lms_course_id_fk" FOREIGN KEY ("prerequisite_course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course_product" ADD CONSTRAINT "lms_course_product_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course_product" ADD CONSTRAINT "lms_course_product_product_category_id_product_category_id_fk" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course_review" ADD CONSTRAINT "lms_course_review_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course_review" ADD CONSTRAINT "lms_course_review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course_to_category" ADD CONSTRAINT "lms_course_to_category_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course_to_category" ADD CONSTRAINT "lms_course_to_category_category_id_lms_course_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."lms_course_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course_to_tag" ADD CONSTRAINT "lms_course_to_tag_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_course_to_tag" ADD CONSTRAINT "lms_course_to_tag_tag_id_lms_course_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."lms_course_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_discussion_reply" ADD CONSTRAINT "lms_discussion_reply_thread_id_lms_discussion_thread_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."lms_discussion_thread"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_discussion_reply" ADD CONSTRAINT "lms_discussion_reply_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_discussion_thread" ADD CONSTRAINT "lms_discussion_thread_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_discussion_thread" ADD CONSTRAINT "lms_discussion_thread_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_discussion_thread" ADD CONSTRAINT "lms_discussion_thread_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_enrollment" ADD CONSTRAINT "lms_enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_enrollment" ADD CONSTRAINT "lms_enrollment_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_learner_badge" ADD CONSTRAINT "lms_learner_badge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_learner_badge" ADD CONSTRAINT "lms_learner_badge_badge_id_lms_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."lms_badge"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_lesson" ADD CONSTRAINT "lms_lesson_module_id_lms_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."lms_module"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_module" ADD CONSTRAINT "lms_module_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_note" ADD CONSTRAINT "lms_note_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_note" ADD CONSTRAINT "lms_note_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_progress" ADD CONSTRAINT "lms_progress_enrollment_id_lms_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."lms_enrollment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_progress" ADD CONSTRAINT "lms_progress_content_block_id_lms_content_block_id_fk" FOREIGN KEY ("content_block_id") REFERENCES "public"."lms_content_block"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_progress" ADD CONSTRAINT "lms_progress_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_progress" ADD CONSTRAINT "lms_progress_module_id_lms_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."lms_module"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_question" ADD CONSTRAINT "lms_question_bank_id_lms_question_bank_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."lms_question_bank"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_question_bank" ADD CONSTRAINT "lms_question_bank_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_question_option" ADD CONSTRAINT "lms_question_option_question_id_lms_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."lms_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_quiz" ADD CONSTRAINT "lms_quiz_lesson_id_lms_lesson_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lms_lesson"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_quiz" ADD CONSTRAINT "lms_quiz_module_id_lms_module_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."lms_module"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_quiz" ADD CONSTRAINT "lms_quiz_course_id_lms_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."lms_course"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_quiz_answer" ADD CONSTRAINT "lms_quiz_answer_attempt_id_lms_quiz_attempt_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."lms_quiz_attempt"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_quiz_answer" ADD CONSTRAINT "lms_quiz_answer_question_id_lms_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."lms_question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_quiz_answer" ADD CONSTRAINT "lms_quiz_answer_graded_by_user_id_fk" FOREIGN KEY ("graded_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_quiz_attempt" ADD CONSTRAINT "lms_quiz_attempt_quiz_id_lms_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."lms_quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms_quiz_attempt" ADD CONSTRAINT "lms_quiz_attempt_enrollment_id_lms_enrollment_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."lms_enrollment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cms_content_slug_idx" ON "cms_content" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "cms_content_status_idx" ON "cms_content" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cms_content_author_idx" ON "cms_content" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cms_seo_page_id_idx" ON "cms_seo_fields" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "notification_user_read_idx" ON "notification" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notification_created_idx" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "wishlist_item_user_idx" ON "wishlist_item" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wishlist_item_unique_idx" ON "wishlist_item" USING btree ("user_id","product_id");--> statement-breakpoint
CREATE INDEX "lms_badge_trigger_type_idx" ON "lms_badge" USING btree ("trigger_type");--> statement-breakpoint
CREATE INDEX "lms_bookmark_user_idx" ON "lms_bookmark" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lms_bookmark_user_lesson_idx" ON "lms_bookmark" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "lms_certificate_enrollment_idx" ON "lms_certificate" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "lms_certificate_uid_idx" ON "lms_certificate" USING btree ("certificate_uid");--> statement-breakpoint
CREATE INDEX "lms_certificate_template_course_idx" ON "lms_certificate_template" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lms_content_block_lesson_idx" ON "lms_content_block" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "lms_content_block_lesson_order_idx" ON "lms_content_block" USING btree ("lesson_id","sort_order");--> statement-breakpoint
CREATE INDEX "lms_content_block_type_idx" ON "lms_content_block" USING btree ("type");--> statement-breakpoint
CREATE INDEX "lms_course_slug_idx" ON "lms_course" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "lms_course_status_idx" ON "lms_course" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lms_course_instructor_idx" ON "lms_course" USING btree ("instructor_id");--> statement-breakpoint
CREATE INDEX "lms_course_program_idx" ON "lms_course" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "lms_course_status_featured_idx" ON "lms_course" USING btree ("status","is_featured");--> statement-breakpoint
CREATE INDEX "lms_course_category_slug_idx" ON "lms_course_category" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "lms_course_product_course_idx" ON "lms_course_product" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lms_course_product_category_idx" ON "lms_course_product" USING btree ("product_category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lms_course_product_unique_idx" ON "lms_course_product" USING btree ("course_id","product_category_id");--> statement-breakpoint
CREATE INDEX "lms_course_review_course_idx" ON "lms_course_review" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lms_course_review_user_idx" ON "lms_course_review" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lms_course_review_status_idx" ON "lms_course_review" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "lms_course_review_course_user_idx" ON "lms_course_review" USING btree ("course_id","user_id");--> statement-breakpoint
CREATE INDEX "lms_course_tag_slug_idx" ON "lms_course_tag" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "lms_discussion_reply_thread_idx" ON "lms_discussion_reply" USING btree ("thread_id");--> statement-breakpoint
CREATE INDEX "lms_discussion_reply_user_idx" ON "lms_discussion_reply" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lms_discussion_reply_parent_idx" ON "lms_discussion_reply" USING btree ("parent_reply_id");--> statement-breakpoint
CREATE INDEX "lms_discussion_thread_course_idx" ON "lms_discussion_thread" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lms_discussion_thread_lesson_idx" ON "lms_discussion_thread" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "lms_discussion_thread_user_idx" ON "lms_discussion_thread" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lms_discussion_thread_course_pinned_idx" ON "lms_discussion_thread" USING btree ("course_id","is_pinned");--> statement-breakpoint
CREATE INDEX "lms_enrollment_user_idx" ON "lms_enrollment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lms_enrollment_course_idx" ON "lms_enrollment" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lms_enrollment_status_idx" ON "lms_enrollment" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "lms_enrollment_user_course_idx" ON "lms_enrollment" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "lms_learner_badge_user_idx" ON "lms_learner_badge" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lms_learner_badge_badge_idx" ON "lms_learner_badge" USING btree ("badge_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lms_learner_badge_user_badge_idx" ON "lms_learner_badge" USING btree ("user_id","badge_id");--> statement-breakpoint
CREATE INDEX "lms_lesson_module_idx" ON "lms_lesson" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "lms_lesson_module_order_idx" ON "lms_lesson" USING btree ("module_id","sort_order");--> statement-breakpoint
CREATE INDEX "lms_module_course_idx" ON "lms_module" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lms_module_course_order_idx" ON "lms_module" USING btree ("course_id","sort_order");--> statement-breakpoint
CREATE INDEX "lms_note_user_idx" ON "lms_note" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "lms_note_user_lesson_idx" ON "lms_note" USING btree ("user_id","lesson_id");--> statement-breakpoint
CREATE INDEX "lms_program_slug_idx" ON "lms_program" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "lms_progress_enrollment_idx" ON "lms_progress" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "lms_progress_enrollment_content_idx" ON "lms_progress" USING btree ("enrollment_id","content_block_id");--> statement-breakpoint
CREATE INDEX "lms_progress_enrollment_lesson_idx" ON "lms_progress" USING btree ("enrollment_id","lesson_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lms_progress_enrollment_content_unique_idx" ON "lms_progress" USING btree ("enrollment_id","content_block_id");--> statement-breakpoint
CREATE INDEX "lms_question_bank_idx" ON "lms_question" USING btree ("bank_id");--> statement-breakpoint
CREATE INDEX "lms_question_type_idx" ON "lms_question" USING btree ("type");--> statement-breakpoint
CREATE INDEX "lms_question_bank_course_idx" ON "lms_question_bank" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lms_question_option_question_idx" ON "lms_question_option" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "lms_quiz_lesson_idx" ON "lms_quiz" USING btree ("lesson_id");--> statement-breakpoint
CREATE INDEX "lms_quiz_module_idx" ON "lms_quiz" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "lms_quiz_course_idx" ON "lms_quiz" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lms_quiz_answer_attempt_idx" ON "lms_quiz_answer" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "lms_quiz_answer_question_idx" ON "lms_quiz_answer" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "lms_quiz_attempt_quiz_idx" ON "lms_quiz_attempt" USING btree ("quiz_id");--> statement-breakpoint
CREATE INDEX "lms_quiz_attempt_enrollment_idx" ON "lms_quiz_attempt" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "lms_quiz_attempt_quiz_enrollment_idx" ON "lms_quiz_attempt" USING btree ("quiz_id","enrollment_id");--> statement-breakpoint
CREATE INDEX "affiliate_status_idx" ON "affiliate" USING btree ("status");