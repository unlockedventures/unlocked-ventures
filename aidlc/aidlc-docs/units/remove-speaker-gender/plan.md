# Plan: Remove host/guest speaker gender

Project: Unlocked Ventures

## Approach

Remove gender end to end in the script pipeline while keeping the stored Payload fields hidden.

## Affected files and design

| Area              | Change                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------- |
| CMS and admin     | `PodcastEpisodes.ts`: set `admin.hidden` on the gender selects. Script and prompt fields: drop gender state, checks and request values. Skeleton CSS: drop gender selectors. |
| Server            | `episode-ai-endpoints.ts`, `run-generate-script.ts`: drop gender parsing, checks and saves. |
| Pipeline          | `script-schema.ts`: speakers hold `role` only; remove gender helpers and `withAdminSpeakers`. `generate-script.ts`, `generate-editor-prompts.ts`: drop gender from prompts. `prompt-revision.ts`: hash summary only, bump to `v2`. `script-button-state.ts`: drop gender check. |

## Content compatibility and rollout

No schema or migration change. Existing scripts parse because the parser ignores extra speaker
keys. Saved script prompts become stale once (revision `v1` → `v2`) and must be regenerated.

## Generated outputs

- `pnpm generate:types`: run; output expected unchanged because the fields remain.
- `pnpm generate:importmap`: not required (no admin component paths change).

## Verification strategy

TypeScript check, ESLint on changed files, and the affected Vitest integration specs.
