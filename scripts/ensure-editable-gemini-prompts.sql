ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS source_summary_prompt varchar;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS source_summary_prompt_revision varchar;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS script_prompt varchar;
ALTER TABLE podcast_episodes ADD COLUMN IF NOT EXISTS script_prompt_revision varchar;
