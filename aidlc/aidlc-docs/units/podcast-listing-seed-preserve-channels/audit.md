# Decision and Change Log: Podcast listing seed preserves episode channels

Project: Unlocked Ventures

| Date       | Actor, if known | Type         | Summary and scope                                                                                                                                       | Evidence or link                                             |
| ---------- | --------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 2026-11-19 | Claude Code     | decision     | Diagnosed: `seedPodcastListing` rewrote channel/category/excerpt/stats/heroFeatured for all episodes at each start; unknown slugs went to Digital engineering | All 69 episodes `updated_at` 06:00:47–06:00:55 during startup |
| 2026-11-19 | User            | decision     | Requested the fix ("implement the fix")                                                                                                                  | Conversation                                                 |
| 2026-11-19 | Claude Code     | decision     | Followed root `AGENTS.md`/`CLAUDE.md` (records add no approval gates) over the G1–G4 gates in `aidlc/AGENTS.md`, which defers to the root file          | Root `AGENTS.md` Working agreement                           |
| 2026-11-19 | Claude Code     | change       | Seed applies starter metadata once (empty excerpt) and otherwise fills empty fields only; unknown slugs untouched; reads all episodes                   | `src/data/seed-podcast-listing.ts`                           |
| 2026-11-19 | Claude Code     | change       | Added idempotent repair script for `ui-scroll-demo-*` episodes; category left to the existing channel-sync hook                                        | `scripts/repair-podcast-scroll-sample-channels.mts`          |
| 2026-11-19 | Claude Code     | verification | Repair run against local Docker DB, restart, SQL checks                                                                                                 | Details below                                                |

## Verification details

Target: local Docker Compose PostgreSQL volume (`unlocked-venture` project). No production data.

- `add-podcast-scroll-samples.mts` (loop 13): `created 4, skipped 61` across 5 active channels.
- Repair first run: `updated 65`. A second run also reported 65 because the "unchanged" check
  required an empty category, which the collection hook always sets from the channel; check
  removed. Third run: `updated 0, unchanged 65, skipped 0`.
- `docker compose restart app`: startup seeds ran; only the pre-existing `success-stories` seed
  failed (Success category `headerNavChild` required).
- After restart: General, Digital engineering, Future, Communication and AI each have 13 demo
  episodes, 0 in a channel other than their slug's. The 8 non-demo episodes' channel and
  `updated_at` were identical before and after the restart.
- `GET /podcast` returned 200 and listed "episode 13" for all five channels.
- TypeScript (`tsc --noEmit` in the app container): 22 errors, all in untouched files; none in
  changed files.
- ESLint: could not run (host and container): `@eslint/eslintrc` not found from
  `eslint.config.mjs`.
- Prettier: new script formatted; seed file was already non-conforming before the change and was
  not reformatted; the changed lines match Prettier output.
- Not verified: the seed's first-run path on an empty database. No automated tests added.
