# Episode form implementation

## Changes

AI episodes now show Title, Channel, Picture, transcript-only Create with AI, Source summary, Generate podcast, Audio generation, Guest/topic/duration, and Featured in that order. Script outputs follow Summary, script.json, Main points, Contrasting points, Disagreement points, UV takes. Both genders precede the script button; both ElevenLabs voice IDs precede the audio button. Their labels and descriptions explain the generation requirement without adding collection-level required flags.

PodcastEpisodes.ts retains one definition per stored field and uses unnamed collapsibles, preserving existing flat fields. A small EpisodePodcastLabel component observes editorMode through useFormFields and labels the shared content section Generate podcast in AI mode and About this episode in manual mode. Manual content, audio and transcript editors remain available before details and Featured. Generation controls remain AI-only. Existing relationships and public field names are retained. The approved FR6 addition introduces separate persisted source-summary metadata, an endpoint, and changes the episode script input as described below.

The audio click guard now respects a live input that was cleared or contains only whitespace instead of falling back to a stale saved voice ID. Existing gender and voice-ID action guards remain in place. Transcript guidance reflects Picture's earlier position; audio guidance uses UV takes. The script skeleton follows Summary/script output order, and no longer hides voice inputs belonging to the separate audio section.

## Files

- src/collections/PodcastEpisodes.ts: section order, mode conditions, required-at-action guidance, UV takes.
- src/components/admin/episode-podcast-label.tsx: mode-aware heading for shared editorial fields.
- src/components/admin/generate-audio-field.tsx: live blank voice-ID handling.
- src/components/admin/generate-script-field.tsx and generate-podcast-skeleton.css: loading presentation.
- src/pipeline/button-state.ts and audio-button-state.ts: updated editor guidance.
- src/payload-types.ts and src/app/(payload)/admin/importMap.js: Payload-generated field order and label registration.
- tests/int/pipeline-button.int.spec.ts, pipeline-audio-button.int.spec.ts and transcript-save-links.int.spec.tsx: existing literal expectations updated for changed wording; not executed after changes.

## Verification evidence and limitations

Before source edits, the approved focused command passed all 32 tests across five files. Baseline `DATABASE_URL=postgresql://localhost:1/episode_form_verification pnpm test` recorded 160 passing tests, three failures, one skipped database test, and two unhandled rejections across 29 files. Frontend-error lacked QueryClientProvider; not-found/site-layout had async rendering failures. The database-dependent suite could not initialize against the intentionally unreachable address. This protected populated databases from Payload onInit seeds; it is an unavailable isolated database prerequisite, not evidence of a database regression. The full test command stopped before Playwright.

After baseline collection the user explicitly said “no need of testing”, then requested completion. No new tests, post-change test executions, lint, type check, build or browser checks were run. All changed behavior, responsive layout, round-trip persistence and unchanged generation behavior remain unverified by execution. Existing baseline results are not post-change evidence. Existing test wording was updated only; no additional test cases were introduced. The plan's uncompleted test/verification checkboxes remain unchecked because those steps were waived, rather than falsely marked complete.

Required commands `pnpm generate:types` and `pnpm generate:importmap` completed successfully. Source inspection of Payload's CLI confirmed these commands load configuration without calling getPayload/onInit, so no seeds, migrations or providers ran. Generated diffs retain flat field paths; changed type positions follow field ordering and the import map includes EpisodePodcastLabel. Generators are not tests and do not establish runtime correctness.

## Design review and deviations

The original ordering source review kept shared definitions authoritative, reused existing Payload conditions and generation components, and introduced the small label component needed to present the same stored fields in both modes. Audio prerequisite behavior changes only for cleared live voice inputs. The subsequent approved FR6 extension requires the additive migration and helpers below.

The user waived additional tests and verification after the pre-change baseline. Those steps were not executed, and acceptance mappings distinguish implementation paths from unverified runtime outcomes. The original ordering-only plan's waived steps were not marked complete. The revised source-summary plan explicitly excludes testing.

## Source-summary addition (FR6 / AC7.1–AC7.7)

A dedicated Generate source summary button follows Create with AI. It requires every current video resource to have a completed, nonblank transcript for its current URL and a nonblank combined transcript. It submits only an explicit summary action. The dedicated summarizer uses the existing Gemini adapter/configuration, sends the complete combined transcript as untrusted source data, validates a nonblank result, and applies a 120-second provider timeout. No truncation or raw-transcript fallback is introduced. Failure retains previous source-summary text.

The editable sourceSummary is distinct from the existing episode Summary output. A browser-safe SHA-256 identity covers the current URLs, per-video results/statuses and combined source text. The server computes its own identity; ordinary editor saves cannot forge source-summary job state, revision or lease metadata. Source edits preserve content while invalidating current-summary eligibility. Script generation requires a ready current summary, accepts the live edited summary plus matching revision, persists the edited text, and supplies only that summary to the existing script output contract. Existing AI episodes must generate a summary before their next script; manual mode and incomplete draft saving do not require one.

Read/Update checks and record access protect the new endpoint. An atomic PostgreSQL per-episode lease covers transcription, source summary, script and audio operations across workers. It prevents conflicting requests, expires after one hour after a crash, and normally releases in finally. Expiry recovery resets old processing states. Job writes check the lease token, and summary/script results re-read and revalidate sources before acceptance, with an additional hook revision guard. Provider failures use fixed messages rather than source-bearing errors. No summary credentials or source bodies are logged. UI prerequisites block current conflicting actions; summary polling runs only while that job is processing, not while idle.

Additional implementation paths: src/pipeline/source-summary.ts; generate-source-summary.ts; episode-generation-lock.ts; episode-ai-endpoints.ts; generate-script.ts; script-button-state.ts; src/components/admin/use-source-summary.ts; generate-source-summary-field.tsx; updated transcript/script/audio controls and PodcastEpisodes hook/fields. Payload types and admin import map were regenerated with the documented commands. No application checks or provider requests ran for this addition.

## Source-summary rollout and rollback

scripts/ensure-source-summary.sql and registered src/migrations/20261023_120000_source_summary.ts add summary, revision, job and bounded lease columns. scripts/ensure-schema.mjs includes the SQL; Docker uses that existing strict startup path, documented in scripts/docker-dev.sh. README.md documents the workflow, required schema rollout, existing-episode compatibility and crash recovery.

Apply `pnpm ensure-schema` or `pnpm migrate` to the target database before serving the new code. Neither command, SQL, seeds, backfills nor any database mutation was executed here. Production startup does not run this migration automatically. Fresh development databases continue to use Payload's existing creation path. Rollback restores application code and leaves additive columns/content intact; the migration's down function intentionally retains data.

All FR6 acceptance remains unverified by execution at the user's explicit request. The pre-change ordering baseline above does not verify this new layer. No new tests, test executions, lint, type checks, builds or browser checks were added/run. Necessary Payload generators completed without database initialization. Source inspection provides implementation mapping only, not passed acceptance evidence.
