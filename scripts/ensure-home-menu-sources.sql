-- Additive only: preserve old offerings and all presentation/media associations.
ALTER TABLE IF EXISTS "strategic_advisory" ADD COLUMN IF NOT EXISTS "menu_source" varchar;
ALTER TABLE IF EXISTS "digital_engineering" ADD COLUMN IF NOT EXISTS "menu_source" varchar;
ALTER TABLE IF EXISTS "strategic_advisory" ADD COLUMN IF NOT EXISTS "menu_presentation_archive" jsonb;
ALTER TABLE IF EXISTS "digital_engineering" ADD COLUMN IF NOT EXISTS "menu_presentation_archive" jsonb;
ALTER TABLE IF EXISTS "strategic_advisory_groups" ADD COLUMN IF NOT EXISTS "source_group_id" varchar;
ALTER TABLE IF EXISTS "digital_engineering_groups" ADD COLUMN IF NOT EXISTS "source_group_id" varchar;

-- Source group titles/icons can be absent; current names are read from Navigation.
ALTER TABLE IF EXISTS "strategic_advisory_groups" ALTER COLUMN "title" DROP NOT NULL;
ALTER TABLE IF EXISTS "digital_engineering_groups" ALTER COLUMN "title" DROP NOT NULL;
ALTER TABLE IF EXISTS "strategic_advisory_groups" ALTER COLUMN "icon_id" DROP NOT NULL;
ALTER TABLE IF EXISTS "digital_engineering_groups" ALTER COLUMN "icon_id" DROP NOT NULL;
