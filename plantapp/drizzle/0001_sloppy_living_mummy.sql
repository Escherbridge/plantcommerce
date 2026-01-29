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
CREATE TABLE "email_verification_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "cms_content" ADD CONSTRAINT "cms_content_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_content" ADD CONSTRAINT "cms_content_seo_fields_id_cms_seo_fields_id_fk" FOREIGN KEY ("seo_fields_id") REFERENCES "public"."cms_seo_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_token" ADD CONSTRAINT "email_verification_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cms_content_slug_idx" ON "cms_content" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "cms_content_status_idx" ON "cms_content" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cms_content_author_idx" ON "cms_content" USING btree ("author_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cms_seo_page_id_idx" ON "cms_seo_fields" USING btree ("page_id");