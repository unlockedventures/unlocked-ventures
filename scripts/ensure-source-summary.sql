-- Additive only. Existing episode outputs and summary text remain untouched.
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS source_summary varchar;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS current_source_revision varchar;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS source_summary_revision varchar;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS source_summary_status varchar DEFAULT 'idle';
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS source_summary_message varchar;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS generation_lock varchar;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS generation_lock_expires_at timestamptz(3);
