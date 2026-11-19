# Tasks: Podcast listing seed preserves episode channels

Project: Unlocked Ventures

| ID  | Task                                                                             | Status | Owner, if known | Evidence or notes                                         |
| --- | -------------------------------------------------------------------------------- | ------ | --------------- | --------------------------------------------------------- |
| T1  | Make `src/data/seed-podcast-listing.ts` episode defaults initialize-once/fill-empty | done   |                 | FR-1–FR-3; AC-2                                           |
| T2  | Add `scripts/repair-podcast-scroll-sample-channels.mts`                          | done   |                 | FR-4; AC-3 (second run: 0 updated, 65 unchanged)          |
| T3  | Raise `scripts/add-podcast-scroll-samples.mts` loop to 13                         | done   |                 | FR-5; edit made by the user before this unit, kept as is  |
| T4  | Run repair and restart against local Docker database                             | done   |                 | AC-1: 13 demo episodes in each of 5 active channels       |
| T5  | Refresh `frontend-demo` mocks for Vercel                                         | todo   |                 | Out of scope; needs merge, export, commit, authorized push |

## Completion checks

- [x] Requested behavior implemented with existing framework patterns.
- [x] Persisted editor content, slugs, routes and relationships preserved (real episodes unchanged
      across restart).
- [x] No new server endpoint or permission surface.
- [x] No schema change; no generated outputs required.
- [x] Static checks and manual database checks completed (see limitations).
- [x] Limitations recorded.

## Handoff notes

### 2026-11-19 — Claude Code

- Completed: seed fix, repair script, repair run, restart verification.
- Next: commit on `develop`; merge `develop` into `frontend-demo`; `pnpm export:demo-mocks`;
  review diff; commit and push when authorized.
- Constraints: fresh-database initialization path (empty excerpt) not exercised; ESLint cannot
  load in this environment (missing `@eslint/eslintrc`); real episodes' earlier channel resets are
  not recoverable.
- Files touched: `src/data/seed-podcast-listing.ts`,
  `scripts/repair-podcast-scroll-sample-channels.mts`, this unit folder.
- Checks run: see `audit.md`.
