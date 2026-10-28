# Decision and Change Log: Self-hosted Kokoro podcast audio

Project: Unlocked Ventures

| Date       | Actor, if known | Type           | Summary and scope                                                                                                                                                | Evidence or link                                   |
| ---------- | --------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 2026-10-28 | User            | Decision       | Replace ElevenLabs podcast audio generation with self-hosted Kokoro and request a step-by-step implementation plan.                                              | Conversation request                               |
| 2026-10-28 | Codex           | Decision       | Plan retains `hostVoiceId` and `guestVoiceId` as compatibility fields and replaces the provider behind the existing sequential PCM/WAV pipeline.                 | `plan.md`                                          |
| 2026-10-28 | Codex           | Verification   | Inspected current ElevenLabs adapter, audio assembler/runner, protected endpoints, admin component, Payload fields, environment and Compose configuration.       | Repository source paths listed in `plan.md`        |
| 2026-10-28 | User            | Decision       | Future generated podcast audio will be stored in AWS S3, with its link/reference retained in the database.                                                       | Conversation request                               |
| 2026-10-28 | Codex           | Decision       | Keep Kokoro output behind Payload's `podcast-audio` upload collection; implement S3 later as a storage-adapter rollout.                                          | `requirements.md`, `plan.md`                       |
| 2026-10-28 | User            | Decision       | Replace the public episode player's browser TTS as part of the Kokoro audio feature.                                                                             | Conversation request                               |
| 2026-10-28 | Codex           | Verification   | Confirmed `EpisodePlayer` currently gives transcript/browser TTS precedence over an available stored `mediaUrl`.                                                 | `src/components/site/podcast/episode-player.tsx`   |
| 2026-10-28 | Codex           | Decision       | Published playback will use stored generated/uploaded media only; transcript remains readable content and is not a playback fallback.                            | `requirements.md`, `plan.md`                       |
| 2026-10-28 | User            | Decision       | Episode Duration will be populated automatically from the attached audio length.                                                                                 | Conversation request                               |
| 2026-10-28 | Codex           | Verification   | Confirmed Duration is currently the editable `meta` string consumed by podcast cards, listings and episode details.                                              | `src/collections/PodcastEpisodes.ts`, `src/data/`  |
| 2026-10-28 | Codex           | Decision       | Preserve `meta` for compatibility, make it read-only, compute Kokoro duration from final samples and extract supported upload duration server-side.              | `requirements.md`, `plan.md`                       |
| 2026-10-28 | Codex           | Implementation | Replaced the ElevenLabs adapter with bounded Kokoro voice-list and PCM synthesis calls; pinned the private CPU service to `v0.9.0`.                              | `src/pipeline/kokoro.ts`, `docker-compose.yml`     |
| 2026-10-28 | Codex           | Implementation | Removed browser SpeechSynthesis playback and made the stored episode `mediaUrl` the public player's only audio source.                                           | `src/components/site/podcast/episode-player.tsx`   |
| 2026-10-28 | Codex           | Implementation | Added canonical audio duration seconds, server-side upload inspection and compatible formatted episode duration synchronization.                                 | `PodcastAudio.ts`, `PodcastEpisodes.ts`, migration |
| 2026-10-28 | Codex           | Verification   | Kokoro became healthy locally, exposed 72 voices, and returned valid even-length 24 kHz PCM through both the service API and application adapter.                | Live Docker smoke check                            |
| 2026-10-28 | Codex           | Verification   | All 19 focused Kokoro, assembly, duration, player and audio-button tests passed.                                                                                 | Focused Vitest run                                 |
| 2026-10-28 | Codex           | Verification   | Applied the additive schema ensure successfully and confirmed `podcast_audio.duration_seconds` is numeric.                                                       | Docker PostgreSQL schema inspection                |
| 2026-10-28 | User            | Decision       | Host and guest Kokoro voices must be selected from dropdown lists.                                                                                               | Admin review feedback                              |
| 2026-10-28 | Codex           | Implementation | Replaced the editable voice/datalist controls with true dropdowns populated by the protected live Kokoro voice catalog; saved unavailable values remain visible. | `kokoro-voice-field.tsx`                           |
| 2026-10-28 | User            | Decision       | Audio generation must show percentage progress and provide a listen option when complete.                                                                        | Admin review feedback                              |
| 2026-10-28 | Codex           | Implementation | Added persisted per-turn progress updates, an admin progress bar and an inline player backed by the newly attached episode media URL.                            | Audio generator, runner and admin field            |
| 2026-10-28 | User            | Decision       | Generated or regenerated audio must remain a preview until explicitly saved; public listeners continue hearing the prior audio.                                  | Admin review feedback                              |
| 2026-10-28 | Codex           | Implementation | Added server-owned pending audio fields, preview/save/regenerate controls and an explicit commit endpoint; only commit changes the public audio relationship.    | Audio pipeline, CMS schema and admin field         |
| 2026-10-28 | User            | Decision       | Editors need a button to stop audio while it is generating.                                                                                                      | Admin review feedback                              |
| 2026-10-28 | Codex           | Implementation | Added a protected stop endpoint, active-request cancellation and a processing-only Stop Generating Audio button.                                                 | Kokoro adapter, endpoint and admin field           |
| 2026-10-28 | Codex           | Fix            | Clear the transient stopping message when the job leaves processing and normalize response-body aborts to the stopped message.                                   | Kokoro adapter and admin field                     |
| 2026-10-28 | Codex           | Fix            | Show pending previews and previously saved audio independently of job errors, and normalize existing aborted status messages.                                    | Admin player, generator and schema ensure          |

## Verification details

The Payload type file and admin import map were regenerated with the project commands. Compose
configuration validation passed, the app started with the healthy Kokoro dependency, and an
unauthenticated request to the protected voice endpoint returned HTTP 401.

The full integration suite passed 28 files in Docker but retained four unrelated failures: existing
frontend error/not-found/site-layout test harness issues and an interactive Payload enum-schema
prompt that timed out. Repository-wide TypeScript checking still reports pre-existing errors in
unrelated media, admin, seed and data-loader code. Targeted ESLint could not start because the
repository's ESLint 9 configuration fails while serializing a circular config object. `git diff
--check` passed.

A representative full-episode benchmark on production-class hardware and editorial approval of
voices remain rollout work. The future S3 account, bucket, access policy, retention and local-file
migration are intentionally not selected or implemented; the Payload upload boundary is preserved
for that separate feature.
