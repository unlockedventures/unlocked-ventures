ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS pending_audio_id integer;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS pending_audio_url character varying;

DO $$ BEGIN
  ALTER TABLE podcast_episodes
    ADD CONSTRAINT podcast_episodes_pending_audio_id_podcast_audio_id_fk
    FOREIGN KEY (pending_audio_id) REFERENCES podcast_audio(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS podcast_episodes_pending_audio_idx
  ON podcast_episodes USING btree (pending_audio_id);

UPDATE podcast_episodes
SET audio_status_message = 'Audio generation stopped.'
WHERE audio_status = 'error'
  AND audio_status_message IS NOT NULL
  AND lower(audio_status_message) LIKE '%abort%';
