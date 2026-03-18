CREATE TABLE "account_locks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"reason" text NOT NULL,
	"locked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unlock_token" text,
	"unlocked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "email_verification_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"identifier_type" text NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"last_attempt" timestamp with time zone DEFAULT now() NOT NULL,
	"blocked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "remember_me" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "account_locks" ADD CONSTRAINT "account_locks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_token" ADD CONSTRAINT "email_verification_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_locks_user_idx" ON "account_locks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "account_locks_token_idx" ON "account_locks" USING btree ("unlock_token");--> statement-breakpoint
CREATE INDEX "login_attempts_identifier_idx" ON "login_attempts" USING btree ("identifier","identifier_type");--> statement-breakpoint
CREATE INDEX "login_attempts_blocked_idx" ON "login_attempts" USING btree ("blocked_until");--> statement-breakpoint
CREATE INDEX "social_accounts_user_idx" ON "social_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "social_accounts_provider_idx" ON "social_accounts" USING btree ("provider","provider_user_id");