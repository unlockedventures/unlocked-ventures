# Local source-summary schema repair

## Reported issue and diagnosis
The user reported a failed episode-list SQL query selecting the new source-summary columns. Inspection through the running Docker app's configured database connection found none of the seven expected columns on public.podcast_episodes. The application was already running when the new code was introduced, so its startup schema path had not applied this addition.

## Action and evidence
Applied only scripts/ensure-source-summary.sql through the running app's database configuration, inside a transaction with a five-second lock timeout and thirty-second statement timeout. The script adds seven columns with IF NOT EXISTS; no seeds, backfills, content updates or deletes ran. The transaction committed successfully.

A follow-up SELECT of all seven new columns, ordered like the episode list and limited to ten rows, succeeded. No episode content or credentials were printed. This diagnoses and repairs the missing-column failure on the configured local database; it is not a full application/browser test. The prior instruction to omit further test suites remains respected. Other databases still require their own additive schema rollout.
