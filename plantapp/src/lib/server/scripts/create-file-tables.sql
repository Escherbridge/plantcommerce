-- Migration script to add file tables and update existing schemas
-- Run this after setting up your GCP bucket and service account

-- Create the file table
CREATE TABLE IF NOT EXISTS "file" (
    "id" text PRIMARY KEY,
    "filename" text NOT NULL,
    "original_filename" text NOT NULL,
    "mime_type" text NOT NULL,
    "file_size" integer NOT NULL,
    "bucket_path" text NOT NULL,
    "bucket_name" text NOT NULL DEFAULT 'aevani-files',
    "entity_type" text NOT NULL DEFAULT 'general',
    "entity_id" text,
    "uploaded_by" text,
    "is_public" boolean NOT NULL DEFAULT false,
    "metadata" text,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for the file table
CREATE UNIQUE INDEX IF NOT EXISTS "file_bucket_path_idx" ON "file" ("bucket_path");
CREATE INDEX IF NOT EXISTS "file_entity_idx" ON "file" ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "file_uploaded_by_idx" ON "file" ("uploaded_by");
CREATE INDEX IF NOT EXISTS "file_created_idx" ON "file" ("created_at");

-- Add foreign key constraints (if your database supports adding them later)
-- ALTER TABLE "file" ADD CONSTRAINT "file_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("id");

-- Add file reference columns to existing tables
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "avatar_file_id" text;
ALTER TABLE "product_image" ADD COLUMN IF NOT EXISTS "file_id" text;
ALTER TABLE "content_page" ADD COLUMN IF NOT EXISTS "featured_image_file_id" text;

-- Optional: Add foreign key constraints for the new columns
ALTER TABLE "user" ADD CONSTRAINT "user_avatar_file_id_fkey" FOREIGN KEY ("avatar_file_id") REFERENCES "file"("id");
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE CASCADE;
ALTER TABLE "content_page" ADD CONSTRAINT "content_page_featured_image_file_id_fkey" FOREIGN KEY ("featured_image_file_id") REFERENCES "file"("id");

-- Note: If migrating from existing URL-based system, you'll need to:
-- 1. Upload existing images to GCS using the FileService
-- 2. Create file records for them 
-- 3. Update product_image records to use file_id instead of url
-- 4. Drop the old url column: ALTER TABLE "product_image" DROP COLUMN "url";
