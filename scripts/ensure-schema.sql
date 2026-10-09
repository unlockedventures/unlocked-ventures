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
-- podcast_episodes
-- ---------------------------------------------------------------------------
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS category character varying;
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
