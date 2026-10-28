-- Additive only. Existing audio and episode relationships remain untouched.
ALTER TABLE podcast_audio ADD COLUMN IF NOT EXISTS duration_seconds numeric;
