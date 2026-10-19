-- Idempotent additive schema for existing Docker volumes.
-- Safe to re-run. Does not drop or rename columns (old code keeps working).
-- Fresh empty databases still use Payload push (PAYLOAD_DB_PUSH=true).

-- ---------------------------------------------------------------------------
-- success_stories
-- ---------------------------------------------------------------------------
ALTER TABLE success_stories ADD COLUMN IF NOT EXISTS subtitle character varying;

-- ---------------------------------------------------------------------------
-- about / experience accordion
-- ---------------------------------------------------------------------------
ALTER TABLE about ADD COLUMN IF NOT EXISTS experience_title character varying;
UPDATE about SET experience_title = 'Experience' WHERE experience_title IS NULL;
DO $$ BEGIN
  ALTER TABLE about ALTER COLUMN experience_title SET DEFAULT 'Experience';
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE about ALTER COLUMN experience_title SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS about_experience_roles (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  role character varying NOT NULL,
  company character varying NOT NULL,
  date_label character varying NOT NULL,
  summary character varying,
  default_open boolean DEFAULT false,
  CONSTRAINT about_experience_roles_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS about_experience_roles_order_idx ON about_experience_roles USING btree (_order);
CREATE INDEX IF NOT EXISTS about_experience_roles_parent_id_idx ON about_experience_roles USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE about_experience_roles
    ADD CONSTRAINT about_experience_roles_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES about(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS about_experience_roles_highlights (
  _order integer NOT NULL,
  _parent_id character varying NOT NULL,
  id character varying NOT NULL,
  text character varying NOT NULL,
  CONSTRAINT about_experience_roles_highlights_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS about_experience_roles_highlights_order_idx ON about_experience_roles_highlights USING btree (_order);
CREATE INDEX IF NOT EXISTS about_experience_roles_highlights_parent_id_idx ON about_experience_roles_highlights USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE about_experience_roles_highlights
    ADD CONSTRAINT about_experience_roles_highlights_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES about_experience_roles(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- news_posts (insights article fields)
-- ---------------------------------------------------------------------------
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS author_name character varying;
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS author_image_id integer;
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS published_at timestamp(3) with time zone;
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS read_time character varying;
CREATE INDEX IF NOT EXISTS news_posts_author_image_idx ON news_posts USING btree (author_image_id);
DO $$ BEGIN
  ALTER TABLE news_posts
    ADD CONSTRAINT news_posts_author_image_id_media_id_fk
    FOREIGN KEY (author_image_id) REFERENCES media(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS news_posts_tags (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  label character varying NOT NULL,
  CONSTRAINT news_posts_tags_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS news_posts_tags_order_idx ON news_posts_tags USING btree (_order);
CREATE INDEX IF NOT EXISTS news_posts_tags_parent_id_idx ON news_posts_tags USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE news_posts_tags
    ADD CONSTRAINT news_posts_tags_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES news_posts(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS news_posts_blocks_paragraph (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying NOT NULL,
  text character varying NOT NULL,
  block_name character varying,
  CONSTRAINT news_posts_blocks_paragraph_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS news_posts_blocks_paragraph_order_idx ON news_posts_blocks_paragraph USING btree (_order);
CREATE INDEX IF NOT EXISTS news_posts_blocks_paragraph_parent_id_idx ON news_posts_blocks_paragraph USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS news_posts_blocks_paragraph_path_idx ON news_posts_blocks_paragraph USING btree (_path);
DO $$ BEGIN
  ALTER TABLE news_posts_blocks_paragraph
    ADD CONSTRAINT news_posts_blocks_paragraph_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES news_posts(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS news_posts_blocks_heading (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying NOT NULL,
  title character varying NOT NULL,
  block_name character varying,
  CONSTRAINT news_posts_blocks_heading_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS news_posts_blocks_heading_order_idx ON news_posts_blocks_heading USING btree (_order);
CREATE INDEX IF NOT EXISTS news_posts_blocks_heading_parent_id_idx ON news_posts_blocks_heading USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS news_posts_blocks_heading_path_idx ON news_posts_blocks_heading USING btree (_path);
DO $$ BEGIN
  ALTER TABLE news_posts_blocks_heading
    ADD CONSTRAINT news_posts_blocks_heading_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES news_posts(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS news_posts_blocks_quote (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying NOT NULL,
  text character varying NOT NULL,
  attribution character varying,
  block_name character varying,
  CONSTRAINT news_posts_blocks_quote_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS news_posts_blocks_quote_order_idx ON news_posts_blocks_quote USING btree (_order);
CREATE INDEX IF NOT EXISTS news_posts_blocks_quote_parent_id_idx ON news_posts_blocks_quote USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS news_posts_blocks_quote_path_idx ON news_posts_blocks_quote USING btree (_path);
DO $$ BEGIN
  ALTER TABLE news_posts_blocks_quote
    ADD CONSTRAINT news_posts_blocks_quote_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES news_posts(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS news_posts_blocks_list (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying NOT NULL,
  block_name character varying,
  CONSTRAINT news_posts_blocks_list_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS news_posts_blocks_list_order_idx ON news_posts_blocks_list USING btree (_order);
CREATE INDEX IF NOT EXISTS news_posts_blocks_list_parent_id_idx ON news_posts_blocks_list USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS news_posts_blocks_list_path_idx ON news_posts_blocks_list USING btree (_path);
DO $$ BEGIN
  ALTER TABLE news_posts_blocks_list
    ADD CONSTRAINT news_posts_blocks_list_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES news_posts(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS news_posts_blocks_list_items (
  _order integer NOT NULL,
  _parent_id character varying NOT NULL,
  id character varying NOT NULL,
  text character varying NOT NULL,
  CONSTRAINT news_posts_blocks_list_items_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS news_posts_blocks_list_items_order_idx ON news_posts_blocks_list_items USING btree (_order);
CREATE INDEX IF NOT EXISTS news_posts_blocks_list_items_parent_id_idx ON news_posts_blocks_list_items USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE news_posts_blocks_list_items
    ADD CONSTRAINT news_posts_blocks_list_items_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES news_posts_blocks_list(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS news_posts_blocks_image (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  _path text NOT NULL,
  id character varying NOT NULL,
  image_id integer,
  image_alt character varying,
  block_name character varying,
  CONSTRAINT news_posts_blocks_image_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS news_posts_blocks_image_order_idx ON news_posts_blocks_image USING btree (_order);
CREATE INDEX IF NOT EXISTS news_posts_blocks_image_parent_id_idx ON news_posts_blocks_image USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS news_posts_blocks_image_path_idx ON news_posts_blocks_image USING btree (_path);
CREATE INDEX IF NOT EXISTS news_posts_blocks_image_image_idx ON news_posts_blocks_image USING btree (image_id);
DO $$ BEGIN
  ALTER TABLE news_posts_blocks_image
    ADD CONSTRAINT news_posts_blocks_image_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES news_posts(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE news_posts_blocks_image
    ADD CONSTRAINT news_posts_blocks_image_image_id_media_id_fk
    FOREIGN KEY (image_id) REFERENCES media(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- podcast_channels
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS podcast_channels (
  id serial PRIMARY KEY,
  title character varying NOT NULL,
  slug character varying,
  description character varying,
  sort_order numeric DEFAULT 0,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS podcast_channels_slug_idx ON podcast_channels USING btree (slug);
CREATE INDEX IF NOT EXISTS podcast_channels_updated_at_idx ON podcast_channels USING btree (updated_at);
CREATE INDEX IF NOT EXISTS podcast_channels_created_at_idx ON podcast_channels USING btree (created_at);

ALTER TABLE podcast_channels ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
UPDATE podcast_channels SET active = true WHERE active IS NULL;

INSERT INTO podcast_channels (title, slug, description, sort_order, active)
SELECT 'General', 'general', 'Default channel for existing episodes.', 0, true
WHERE NOT EXISTS (SELECT 1 FROM podcast_channels LIMIT 1);

-- ---------------------------------------------------------------------------
-- podcast_episodes
-- ---------------------------------------------------------------------------
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS channel_id integer;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS category character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS image_source character varying DEFAULT 'upload';
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS image_url character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS audio_source character varying DEFAULT 'url';
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS audio_id integer;

CREATE TABLE IF NOT EXISTS podcast_audio (
  id serial PRIMARY KEY,
  alt character varying,
  prefix character varying,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  url character varying,
  thumbnail_u_r_l character varying,
  filename character varying,
  mime_type character varying,
  filesize numeric,
  width numeric,
  height numeric,
  focal_x numeric,
  focal_y numeric
);
CREATE UNIQUE INDEX IF NOT EXISTS podcast_audio_filename_idx ON podcast_audio USING btree (filename);
CREATE INDEX IF NOT EXISTS podcast_audio_updated_at_idx ON podcast_audio USING btree (updated_at);
CREATE INDEX IF NOT EXISTS podcast_audio_created_at_idx ON podcast_audio USING btree (created_at);

DO $$ BEGIN
  ALTER TABLE podcast_episodes
    ADD CONSTRAINT podcast_episodes_audio_id_podcast_audio_id_fk
    FOREIGN KEY (audio_id) REFERENCES podcast_audio(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS podcast_episodes_audio_idx ON podcast_episodes USING btree (audio_id);

-- Payload lock/preference relation columns for new collections
ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS podcast_audio_id integer;
ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS podcast_channels_id integer;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_podcast_audio_id_idx
  ON payload_locked_documents_rels USING btree (podcast_audio_id);
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_podcast_channels_id_idx
  ON payload_locked_documents_rels USING btree (podcast_channels_id);
DO $$ BEGIN
  ALTER TABLE payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_podcast_audio_fk
    FOREIGN KEY (podcast_audio_id) REFERENCES podcast_audio(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_podcast_channels_fk
    FOREIGN KEY (podcast_channels_id) REFERENCES podcast_channels(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

UPDATE podcast_episodes pe
SET channel_id = (SELECT id FROM podcast_channels ORDER BY id ASC LIMIT 1)
WHERE pe.channel_id IS NULL
  AND EXISTS (SELECT 1 FROM podcast_channels);

UPDATE podcast_episodes pe
SET category = c.title
FROM podcast_channels c
WHERE pe.channel_id = c.id
  AND (pe.category IS NULL OR trim(pe.category) = '');

DO $$ BEGIN
  ALTER TABLE podcast_episodes
    ADD CONSTRAINT podcast_episodes_channel_id_podcast_channels_id_fk
    FOREIGN KEY (channel_id) REFERENCES podcast_channels(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS podcast_episodes_channel_idx ON podcast_episodes USING btree (channel_id);
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS media_url character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS about character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS reading character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS take_intro character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS excerpt character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS stats character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS hero_featured boolean DEFAULT false;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS summary character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS slug character varying;

UPDATE podcast_episodes
SET slug = regexp_replace(lower(coalesce(nullif(trim(title), ''), 'episode-' || id::text)), '[^a-z0-9]+', '-', 'g')
WHERE slug IS NULL OR trim(slug) = '';

UPDATE podcast_episodes
SET slug = 'episode-' || id::text
WHERE slug IS NULL OR trim(slug) = '';

DO $$ BEGIN
  ALTER TABLE podcast_episodes ALTER COLUMN slug SET NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS podcast_episodes_slug_idx ON podcast_episodes USING btree (slug);

CREATE TABLE IF NOT EXISTS podcast_episodes_main_points (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  point character varying NOT NULL,
  CONSTRAINT podcast_episodes_main_points_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_episodes_main_points_order_idx ON podcast_episodes_main_points USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_episodes_main_points_parent_id_idx ON podcast_episodes_main_points USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_episodes_main_points
    ADD CONSTRAINT podcast_episodes_main_points_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_episodes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_episodes_agree (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  title character varying NOT NULL,
  body character varying NOT NULL,
  CONSTRAINT podcast_episodes_agree_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_episodes_agree_order_idx ON podcast_episodes_agree USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_episodes_agree_parent_id_idx ON podcast_episodes_agree USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_episodes_agree
    ADD CONSTRAINT podcast_episodes_agree_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_episodes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_episodes_disagree (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  title character varying NOT NULL,
  body character varying NOT NULL,
  CONSTRAINT podcast_episodes_disagree_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_episodes_disagree_order_idx ON podcast_episodes_disagree USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_episodes_disagree_parent_id_idx ON podcast_episodes_disagree USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_episodes_disagree
    ADD CONSTRAINT podcast_episodes_disagree_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_episodes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_episodes_take (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  title character varying NOT NULL,
  body character varying NOT NULL,
  CONSTRAINT podcast_episodes_take_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_episodes_take_order_idx ON podcast_episodes_take USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_episodes_take_parent_id_idx ON podcast_episodes_take USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_episodes_take
    ADD CONSTRAINT podcast_episodes_take_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_episodes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_episodes_transcript (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  time character varying NOT NULL,
  speaker character varying NOT NULL,
  text character varying NOT NULL,
  CONSTRAINT podcast_episodes_transcript_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_episodes_transcript_order_idx ON podcast_episodes_transcript USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_episodes_transcript_parent_id_idx ON podcast_episodes_transcript USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_episodes_transcript
    ADD CONSTRAINT podcast_episodes_transcript_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_episodes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- podcast_page (episode template globals)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS podcast_page_agree (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  title character varying NOT NULL,
  body character varying NOT NULL,
  CONSTRAINT podcast_page_agree_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_page_agree_order_idx ON podcast_page_agree USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_page_agree_parent_id_idx ON podcast_page_agree USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_page_agree
    ADD CONSTRAINT podcast_page_agree_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_page(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_page_disagree (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  title character varying NOT NULL,
  body character varying NOT NULL,
  CONSTRAINT podcast_page_disagree_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_page_disagree_order_idx ON podcast_page_disagree USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_page_disagree_parent_id_idx ON podcast_page_disagree USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_page_disagree
    ADD CONSTRAINT podcast_page_disagree_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_page(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_page_take (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  title character varying NOT NULL,
  body character varying NOT NULL,
  CONSTRAINT podcast_page_take_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_page_take_order_idx ON podcast_page_take USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_page_take_parent_id_idx ON podcast_page_take USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_page_take
    ADD CONSTRAINT podcast_page_take_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_page(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_page_transcript (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  time character varying NOT NULL,
  speaker character varying NOT NULL,
  text character varying NOT NULL,
  CONSTRAINT podcast_page_transcript_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_page_transcript_order_idx ON podcast_page_transcript USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_page_transcript_parent_id_idx ON podcast_page_transcript USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_page_transcript
    ADD CONSTRAINT podcast_page_transcript_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_page(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_page_chapters (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  time character varying NOT NULL,
  title character varying NOT NULL,
  CONSTRAINT podcast_page_chapters_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_page_chapters_order_idx ON podcast_page_chapters USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_page_chapters_parent_id_idx ON podcast_page_chapters USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_page_chapters
    ADD CONSTRAINT podcast_page_chapters_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_page(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_page_listen_next (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  CONSTRAINT podcast_page_listen_next_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_page_listen_next_order_idx ON podcast_page_listen_next USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_page_listen_next_parent_id_idx ON podcast_page_listen_next USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_page_listen_next
    ADD CONSTRAINT podcast_page_listen_next_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_page(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_page_subscribe (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  CONSTRAINT podcast_page_subscribe_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_page_subscribe_order_idx ON podcast_page_subscribe USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_page_subscribe_parent_id_idx ON podcast_page_subscribe USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_page_subscribe
    ADD CONSTRAINT podcast_page_subscribe_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_page(id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_table THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- case_studies ↔ header nav child
-- ---------------------------------------------------------------------------
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS header_nav_child character varying;
CREATE INDEX IF NOT EXISTS case_studies_header_nav_child_idx ON case_studies USING btree (header_nav_child);

-- ---------------------------------------------------------------------------
-- solutions article body (rich text)
-- ---------------------------------------------------------------------------
ALTER TABLE solutions ADD COLUMN IF NOT EXISTS body jsonb;
DO $$ BEGIN
  ALTER TABLE solutions ALTER COLUMN engagement_title DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE solutions ALTER COLUMN how_we_work_title DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Legacy pipeline columns (no-op when pipeline table already removed)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF to_regclass('public.pipeline') IS NOT NULL THEN
    ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS channel_id integer;
    ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS episode_id integer;
    CREATE INDEX IF NOT EXISTS pipeline_channel_idx ON pipeline USING btree (channel_id);
    CREATE INDEX IF NOT EXISTS pipeline_episode_idx ON pipeline USING btree (episode_id);
    BEGIN
      ALTER TABLE pipeline
        ADD CONSTRAINT pipeline_channel_id_podcast_channels_id_fk
        FOREIGN KEY (channel_id) REFERENCES podcast_channels(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TABLE pipeline
        ADD CONSTRAINT pipeline_episode_id_podcast_episodes_id_fk
        FOREIGN KEY (episode_id) REFERENCES podcast_episodes(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS host_voice_id varchar;
    ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS guest_voice_id varchar;
    ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS audio_status varchar DEFAULT 'idle';
    ALTER TABLE pipeline ADD COLUMN IF NOT EXISTS audio_status_message varchar;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- contact messages + site owner email settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id serial PRIMARY KEY,
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  company character varying NOT NULL,
  email character varying NOT NULL,
  country_code character varying,
  phone character varying,
  message character varying NOT NULL,
  email_sent boolean DEFAULT false,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages USING btree (created_at);
CREATE INDEX IF NOT EXISTS contact_messages_updated_at_idx ON contact_messages USING btree (updated_at);
CREATE INDEX IF NOT EXISTS contact_messages_email_idx ON contact_messages USING btree (email);

ALTER TABLE site ADD COLUMN IF NOT EXISTS owner_email character varying;
ALTER TABLE site ADD COLUMN IF NOT EXISTS contact_email_subject character varying;
ALTER TABLE site ADD COLUMN IF NOT EXISTS contact_email_html character varying;
ALTER TABLE site ADD COLUMN IF NOT EXISTS contact_email_body jsonb;

-- SEO meta description on listing pages and public content
ALTER TABLE podcast_page ADD COLUMN IF NOT EXISTS meta_title character varying;
ALTER TABLE podcast_page ADD COLUMN IF NOT EXISTS meta_description character varying;
ALTER TABLE podcast_listing ADD COLUMN IF NOT EXISTS meta_description character varying;
ALTER TABLE insights ADD COLUMN IF NOT EXISTS meta_description character varying;
ALTER TABLE our_successes ADD COLUMN IF NOT EXISTS meta_description character varying;
ALTER TABLE strategic_growth ADD COLUMN IF NOT EXISTS meta_title character varying;
ALTER TABLE strategic_growth ADD COLUMN IF NOT EXISTS meta_description character varying;
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS meta_title character varying;
ALTER TABLE news_posts ADD COLUMN IF NOT EXISTS meta_description character varying;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS meta_title character varying;
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS meta_description character varying;
ALTER TABLE solutions ADD COLUMN IF NOT EXISTS meta_title character varying;
ALTER TABLE solutions ADD COLUMN IF NOT EXISTS meta_description character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS meta_title character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS meta_description character varying;

-- ---------------------------------------------------------------------------
-- Episodes: draft/complete + AI fields (merged from former pipeline table)
-- ---------------------------------------------------------------------------
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS episode_status character varying DEFAULT 'complete';
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS editor_mode character varying DEFAULT 'manual';
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS source_transcript character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS script_json character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS system_opinion character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS host_gender character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS guest_gender character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS host_voice_id character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS guest_voice_id character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS status character varying DEFAULT 'idle';
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS status_message character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS script_status character varying DEFAULT 'idle';
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS script_status_message character varying;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS audio_status character varying DEFAULT 'idle';
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS audio_status_message character varying;
UPDATE podcast_episodes SET episode_status = 'complete' WHERE episode_status IS NULL;
UPDATE podcast_episodes SET editor_mode = 'manual' WHERE editor_mode IS NULL;
DO $$ BEGIN
  ALTER TABLE podcast_episodes ALTER COLUMN meta DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE podcast_episodes ALTER COLUMN guests DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_episodes_video_links (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  url character varying,
  CONSTRAINT podcast_episodes_video_links_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_episodes_video_links_order_idx ON podcast_episodes_video_links USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_episodes_video_links_parent_id_idx ON podcast_episodes_video_links USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_episodes_video_links
    ADD CONSTRAINT podcast_episodes_video_links_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_episodes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_episodes_contrasting_points (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  point character varying NOT NULL,
  CONSTRAINT podcast_episodes_contrasting_points_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_episodes_contrasting_points_order_idx ON podcast_episodes_contrasting_points USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_episodes_contrasting_points_parent_id_idx ON podcast_episodes_contrasting_points USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_episodes_contrasting_points
    ADD CONSTRAINT podcast_episodes_contrasting_points_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_episodes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS podcast_episodes_disagreement_points (
  _order integer NOT NULL,
  _parent_id integer NOT NULL,
  id character varying NOT NULL,
  point character varying NOT NULL,
  CONSTRAINT podcast_episodes_disagreement_points_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS podcast_episodes_disagreement_points_order_idx ON podcast_episodes_disagreement_points USING btree (_order);
CREATE INDEX IF NOT EXISTS podcast_episodes_disagreement_points_parent_id_idx ON podcast_episodes_disagreement_points USING btree (_parent_id);
DO $$ BEGIN
  ALTER TABLE podcast_episodes_disagreement_points
    ADD CONSTRAINT podcast_episodes_disagreement_points_parent_id_fk
    FOREIGN KEY (_parent_id) REFERENCES podcast_episodes(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Drop redundant pipeline tables (AI create now uses podcast_episodes)
DROP TABLE IF EXISTS pipeline_video_links CASCADE;
DROP TABLE IF EXISTS pipeline_main_points CASCADE;
DROP TABLE IF EXISTS pipeline_contrasting_points CASCADE;
DROP TABLE IF EXISTS pipeline_disagreement_points CASCADE;
DROP TABLE IF EXISTS pipeline CASCADE;

-- ---------------------------------------------------------------------------
-- Success story badges (unique case-insensitive names)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS success_badges (
  id serial PRIMARY KEY,
  name character varying NOT NULL,
  name_key character varying NOT NULL,
  updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
  created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS success_badges_name_key_idx ON success_badges USING btree (name_key);
CREATE INDEX IF NOT EXISTS success_badges_updated_at_idx ON success_badges USING btree (updated_at);
CREATE INDEX IF NOT EXISTS success_badges_created_at_idx ON success_badges USING btree (created_at);

ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS badge_id integer;
CREATE INDEX IF NOT EXISTS case_studies_badge_idx ON case_studies USING btree (badge_id);
DO $$ BEGIN
  ALTER TABLE case_studies
    ADD CONSTRAINT case_studies_badge_id_success_badges_id_fk
    FOREIGN KEY (badge_id) REFERENCES success_badges(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Migrate legacy text badge → success_badges + badge_id
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'case_studies'
      AND column_name = 'badge'
      AND data_type IN ('character varying', 'text')
  ) THEN
    INSERT INTO success_badges (name, name_key, updated_at, created_at)
    SELECT DISTINCT ON (lower(trim(badge)))
      trim(badge),
      lower(trim(badge)),
      now(),
      now()
    FROM case_studies
    WHERE badge IS NOT NULL AND trim(badge) <> ''
      AND NOT EXISTS (
        SELECT 1 FROM success_badges sb WHERE sb.name_key = lower(trim(case_studies.badge))
      );

    UPDATE case_studies cs
    SET badge_id = sb.id
    FROM success_badges sb
    WHERE cs.badge_id IS NULL
      AND cs.badge IS NOT NULL
      AND trim(cs.badge) <> ''
      AND sb.name_key = lower(trim(cs.badge));

    ALTER TABLE case_studies RENAME COLUMN badge TO badge_text_legacy;
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Finish linking from renamed legacy column (re-runs safely)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'case_studies'
      AND column_name = 'badge_text_legacy'
  ) THEN
    INSERT INTO success_badges (name, name_key, updated_at, created_at)
    SELECT DISTINCT ON (lower(trim(badge_text_legacy)))
      trim(badge_text_legacy),
      lower(trim(badge_text_legacy)),
      now(),
      now()
    FROM case_studies
    WHERE badge_text_legacy IS NOT NULL AND trim(badge_text_legacy) <> ''
      AND NOT EXISTS (
        SELECT 1 FROM success_badges sb
        WHERE sb.name_key = lower(trim(case_studies.badge_text_legacy))
      );

    UPDATE case_studies cs
    SET badge_id = sb.id
    FROM success_badges sb
    WHERE cs.badge_id IS NULL
      AND cs.badge_text_legacy IS NOT NULL
      AND trim(cs.badge_text_legacy) <> ''
      AND sb.name_key = lower(trim(cs.badge_text_legacy));
  END IF;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Existing episodes should stay visible on the site after draft/complete lands
UPDATE podcast_episodes SET episode_status = 'complete' WHERE episode_status IS NULL;
UPDATE podcast_episodes SET editor_mode = COALESCE(editor_mode, 'manual');
DO $$ BEGIN
  ALTER TABLE podcast_episodes ALTER COLUMN episode_status SET DEFAULT 'draft';
EXCEPTION WHEN others THEN NULL;
END $$;

ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS success_badges_id integer;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_success_badges_id_idx
  ON payload_locked_documents_rels USING btree (success_badges_id);
DO $$ BEGIN
  ALTER TABLE payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_success_badges_fk
    FOREIGN KEY (success_badges_id) REFERENCES success_badges(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Payload lock relation column for contact-messages (needed to open a message in admin)
ALTER TABLE payload_locked_documents_rels ADD COLUMN IF NOT EXISTS contact_messages_id integer;
CREATE INDEX IF NOT EXISTS payload_locked_documents_rels_contact_messages_id_idx
  ON payload_locked_documents_rels USING btree (contact_messages_id);
DO $$ BEGIN
  ALTER TABLE payload_locked_documents_rels
    ADD CONSTRAINT payload_locked_documents_rels_contact_messages_fk
    FOREIGN KEY (contact_messages_id) REFERENCES contact_messages(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
