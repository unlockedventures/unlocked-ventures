# Tasks: Remove host/guest speaker gender

Project: Unlocked Ventures

| ID  | Task                                                                                     | Status | Evidence or notes |
| --- | ---------------------------------------------------------------------------------------- | ------ | ----------------- |
| T1  | Hide `hostGender`/`guestGender` in `src/collections/PodcastEpisodes.ts`                  | done   | AC-3; fields kept for stored values |
| T2  | Remove gender from script schema, script generation and editor prompts (`src/pipeline/`) | done   | FR-4, AC-2 |
| T3  | Script-prompt revision hashes summary only (`v2`)                                        | done   | FR-5 |
| T4  | Remove gender checks from button state, run handler and AI endpoints                    | done   | FR-2, FR-3, AC-1 |
| T5  | Remove gender from admin script/prompt fields and skeleton CSS                           | done   | FR-1, FR-2 |
| T6  | Update integration and e2e specs                                                         | done   | Legacy gender kept in fixtures to cover AC-2 |
| T7  | Regenerate Payload types                                                                 | done   | Only the two field descriptions were removed |

## Completion checks

- [x] Requested behavior implemented with existing patterns.
- [x] Persisted editor content preserved (columns and values kept; no migration).
- [x] Server-side authorization unchanged for affected endpoints.
- [x] Payload types generated with `pnpm generate:types`; import map not required.
- [x] Affected Vitest specs run (see handoff). ESLint and e2e not run (see limitations).

## Handoff notes

### 2026-11-04 — Claude Code

- Completed: T1–T7.
- Constraints: script prompts saved before this change show "Prompt is out of date" once and must
  be regenerated. Admin flow not exercised manually in a browser.
- Checks run (inside the `app` Docker container):
  - `pnpm generate:types`: succeeded.
  - `tsc --noEmit`: fails with errors only in untouched files (seeds, migrations,
    `episode-generation-lock.ts`, `sync-episode.ts`, `Media.ts`, etc.); none in changed files.
  - `vitest run` on pipeline-script-button, pipeline-script-schema, pipeline-generate-script,
    pipeline-editor-prompts, pipeline-generate-audio: 5 files, 35 tests passed.
  - `prettier --check` on changed files: changed code formatted; `script-schema.ts` has a
    pre-existing unformatted line unrelated to this change.
  - ESLint: could not run (`@eslint/eslintrc` missing in the container).
  - Playwright `transcript-loading.e2e.spec.ts`: updated but not run.
