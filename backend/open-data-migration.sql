ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "country" TEXT NOT NULL DEFAULT 'Vietnam';
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "source_id" TEXT;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "source_url" TEXT;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "license" TEXT;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "image_attribution" JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS "places_source_source_id_key"
ON "places"("source", "source_id");
