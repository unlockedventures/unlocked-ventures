-- Existing untracked resources remain pending; never infer completion from editable text.
DO $$ BEGIN
  CREATE TYPE enum_podcast_episodes_video_links_transcription_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE podcast_episodes_video_links ADD COLUMN IF NOT EXISTS transcription_status enum_podcast_episodes_video_links_transcription_status DEFAULT 'pending';
ALTER TABLE podcast_episodes_video_links ADD COLUMN IF NOT EXISTS video_transcript varchar;
ALTER TABLE podcast_episodes_video_links ADD COLUMN IF NOT EXISTS transcribed_url varchar;
ALTER TABLE podcast_episodes_video_links ADD COLUMN IF NOT EXISTS transcription_error varchar;
UPDATE podcast_episodes_video_links SET transcription_status = 'pending' WHERE transcription_status IS NULL;
