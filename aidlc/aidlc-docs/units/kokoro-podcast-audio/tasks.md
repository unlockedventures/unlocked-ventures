# Tasks: Self-hosted Kokoro podcast audio

Project: Unlocked Ventures

Statuses: `todo`, `in-progress`, `blocked`, `review`, `done`.

| ID  | Task                                                                              | Status | Owner, if known | Evidence or notes                              |
| --- | --------------------------------------------------------------------------------- | ------ | --------------- | ---------------------------------------------- |
| T1  | Select and pin Kokoro-FastAPI image; add private Compose service and health check | done   | Codex           | CPU v0.9.0 is private and healthy              |
| T2  | Add Kokoro server configuration to Compose and `.env.example`                     | done   | Codex           | ElevenLabs variables removed                   |
| T3  | Implement typed Kokoro voice-list and PCM synthesis adapter                       | done   | Codex           | Live API and PCM contract verified             |
| T4  | Make audio assembly provider-neutral and use Kokoro                               | done   | Codex           | Turn order, voices, pauses and WAV retained    |
| T5  | Wire provider into protected generation endpoint and retain generation lock       | done   | Codex           | Existing RBAC and lease retained               |
| T6  | Add protected voice-discovery endpoint                                            | done   | Codex           | Unauthenticated request returns 401            |
| T7  | Update admin voice selection, labels and validation                               | done   | Codex           | Existing stored field names retained           |
| T8  | Remove ElevenLabs runtime integration and stale references                        | done   | Codex           | Runtime adapter/config removed                 |
| T9  | Generate Payload types/import map if required                                     | done   | Codex           | Both generated with project commands           |
| T10 | Add focused tests and run static checks                                           | done   | Codex           | 19 focused tests passed; baseline issues noted |
| T11 | Run live local smoke test and representative benchmark                            | review | Operations      | Smoke passed; target-host benchmark remains    |
| T12 | Update README with setup, operations, recovery and rollout                        | done   | Codex           | Local and future S3 behavior documented        |
| T13 | Preserve and verify the Payload upload boundary for future S3 storage             | done   | Codex           | TTS returns a buffer to Payload upload         |
| T14 | Remove browser SpeechSynthesis playback and make stored `mediaUrl` authoritative  | done   | Codex           | Native media playback only                     |
| T15 | Delete the unused transcript TTS hook and add public-player regression coverage   | done   | Codex           | Regression tests passed                        |
| T16 | Return exact generated-audio duration from final PCM sample count                 | done   | Codex           | Final PCM including pauses is counted          |
| T17 | Update episode `meta` automatically when generated audio is attached              | done   | Codex           | Compatible formatter added                     |
| T18 | Extract duration server-side for supported manual audio uploads                   | done   | Codex           | `music-metadata` parses upload buffer          |
| T19 | Make Duration read-only and test update, replacement and removal behavior         | done   | Codex           | Relationship hook synchronizes/clears value    |
| T20 | Persist and display turn-based generation percentage progress                     | done   | Codex           | Polling displays completed/total turns         |
| T21 | Show an inline listen control after generated audio is attached                   | done   | Codex           | Player uses the resolved episode media URL     |
| T22 | Stage generated audio until an explicit editor save and support regeneration      | done   | Codex           | Public relationship remains unchanged pre-save |
| T23 | Add authorized cancellation for an active Kokoro audio generation                 | done   | Codex           | Abort stops the current and future turns       |

## Completion checks

- [x] Authorized editor can select two Kokoro voices and generate playable attached audio.
- [x] Existing episode content, audio, permissions and generation locks are preserved.
- [x] Kokoro is private by default and provider errors are bounded and sanitized.
- [x] No database migration is required, or any newly discovered requirement is documented and
      implemented additively.
- [x] Required Payload types/admin import map are generated using documented commands.
- [x] Focused tests, lint, TypeScript and live smoke/quality checks are recorded accurately.
- [x] README and all five feature records reflect the final implementation and limitations.
- [x] Generated audio continues through `podcast-audio`, allowing a later S3 adapter rollout
      without changes to Kokoro synthesis or episode playback contracts.
- [x] Public episode playback uses stored local/S3 audio and never invokes browser TTS.
- [x] Transcripts remain readable when audio is present or missing.
- [x] Duration is derived from actual generated/uploaded audio, includes pauses and updates when the
      audio changes.

## Handoff notes, when needed

### 2026-10-28 — Codex

- Completed: Kokoro cutover, protected voice discovery, stored-audio playback, automatic duration,
  additive schema update, documentation, generated artifacts and focused verification.
- Next: Benchmark representative full episodes on the production-class host and approve editorial
  voices before rollout. Implement S3 as a separate storage-adapter feature.
- Constraints: Production hardware and approved voices remain open decisions. AWS
  bucket, access policy, retention and migration choices belong to a separate future rollout.
- Files touched: Pipeline, admin/CMS schemas, public player, Compose/environment, additive migration,
  generated Payload files, tests, README and this feature unit.
- Checks run: 19 focused tests passed; Compose config and live Kokoro health/voices/PCM smoke passed;
  schema ensure applied. Repo-wide test/type/lint limitations are recorded in `audit.md`.
