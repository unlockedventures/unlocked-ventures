# Plan: Podcast listing seed preserves episode channels

Project: Unlocked Ventures

## Approach

Replace the unconditional per-episode update in `seedPodcastListing` with a computed patch:
skip slugs without starter metadata; apply full starter metadata only while the starter episode's
excerpt is empty; otherwise fill only empty category, excerpt, stats, summary and main points.
Skip the update when the patch is empty. Read all episodes (`pagination: false`) rather than the
first 100.

Add `scripts/repair-podcast-scroll-sample-channels.mts`, following the sample script's pattern
(`onInit` disabled, `skipAiContentSync` context), to restore demo rows. Raise the sample script
loop to 13.

## Affected files and design

| Area                  | Proposed change and paths                                            |
| --------------------- | -------------------------------------------------------------------- |
| CMS and admin         | `src/data/seed-podcast-listing.ts` episode loop                      |
| Data and integrations | `scripts/add-podcast-scroll-samples.mts`, new repair script          |

## Content compatibility and rollout

No schema change. The repair script runs once per database that already contains moved demo
episodes. Real episodes are not modified by the repair.

## Generated outputs

- Payload schema changes: not applicable.
- Admin import-map inputs: not applicable.

## Failure handling and recovery

Seed errors are already isolated per seed in `onInit`. The repair script skips slugs whose
channel ID no longer exists.

## Verification strategy

ESLint and TypeScript on changed files; run the repair in the Docker app container; restart the
app; confirm per-channel demo counts and unchanged real-episode `updated_at` via SQL; re-run the
repair to confirm idempotency.

## Operations impact

To refresh the Vercel demo afterwards: merge `develop` into `frontend-demo`, run
`pnpm export:demo-mocks`, review, commit and push (user-authorized).
