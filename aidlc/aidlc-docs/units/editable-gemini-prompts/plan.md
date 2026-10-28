# Plan: Editable Gemini generation prompts

Project: Unlocked Ventures

Gate: G2 — Planning. G1 was approved on 2026-10-28. Do not begin or resume coding until the user
explicitly approves G2.

## Approach

Add a prompt-preparation step before both Gemini content-generation stages. Gemini runs only after
an editor selects Generate Prompt or Regenerate Prompt, and the resulting editorial brief is stored
in an editable Payload textarea. A server-controlled revision identifies the upstream inputs used
for that prompt. Summary and script generation then receive the editor's live prompt alongside
fixed server-owned grounding, safety and output-contract rules.

A source-summary prompt is current only for the active transcript/source revision. A script prompt
is current only for the exact editable summary text and host/guest genders. Changed inputs retain
the prompt for review but block downstream generation until explicit regeneration. Partial pre-gate
code will be reviewed against G1 before it is retained, corrected or replaced.

## Affected files and design

| Area                  | Proposed change and paths                                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CMS and admin         | Add four optional fields in `PodcastEpisodes.ts`; add two prompt-action components; update current generation controls to require and submit live prompts. |
| Server and access     | Add two POST endpoints in `episode-ai-endpoints.ts`; retain episode read/update RBAC, generation leases and stale-source checks.                           |
| Data and integrations | Add Gemini prompt-drafting functions, deterministic prompt identities, fixed/editor prompt composition, additive migration and compatibility SQL.          |
| Tests and docs        | Add focused provider, revision, pipeline and admin tests; update README and all feature records.                                                           |

## Implementation sequence

1. Audit and normalize partial pre-gate work against the approved requirements.
2. Add optional prompt text and hidden revision fields in the appropriate admin sections.
3. Add additive idempotent compatibility SQL and a registered Payload migration.
4. Implement prompt drafting that accepts JSON `{ "prompt": string }` only and sanitizes errors.
5. Compose fixed server contracts, editable editorial briefs and delimited untrusted source data.
6. Add protected prompt endpoints with post-provider stale-input rechecks.
7. Add Generate Prompt/Regenerate Prompt controls with busy, stale and error guidance.
8. Require current, nonblank live prompts for summary and script generation.
9. Bound prompt length without silent truncation.
10. Generate Payload types and admin import map using project commands.
11. Apply and verify additive SQL on the configured development Docker database only.
12. Run focused tests/static checks, update README/records and present G3 evidence.

## Content compatibility and rollout

All fields are nullable and additive. Existing transcripts, summaries, scripts, audio and public
content remain untouched. Existing episodes require a prompt only when an editor next regenerates a
summary or script. Editing or regenerating a prompt never clears prior outputs.

Rollout order: apply compatibility SQL/migration, deploy generated outputs and code together, then
verify prompt actions on an existing AI episode. Rollback leaves nullable prompt fields intact and
older code ignores them.

## Generated outputs

- Run `pnpm generate:types` after schema changes.
- Run `pnpm generate:importmap` for the new admin components.
- Never hand-edit generated outputs.

## Failure handling and recovery

- Invalid, empty or unavailable prompt response: retain the previous prompt and generated outputs.
- Upstream changes during prompt generation: reject the stale response.
- Missing, stale or oversized prompt: reject before downstream Gemini generation.
- Provider failure: sanitize the response, preserve content and release the shared lease.
- Browser timeout: preserve server state and use existing reload/poll recovery where persisted status
  exists.

## Verification strategy

- Test prompt-drafting separation and JSON validation with injected Gemini functions.
- Test fixed requirements plus edited brief composition for both downstream stages.
- Test deterministic staleness for source, summary and gender changes.
- Test missing, stale, oversized and unauthorized requests.
- Test action labels, editable values, disabled generation and explicit replacement behavior.
- Run focused Vitest suites, formatting, `git diff --check` and relevant TypeScript checks.
- Report unrelated repository-wide failures separately.

## Operations impact

No new credential or model configuration is required. Each explicit prompt action adds one Gemini
request. Existing generation locking remains the concurrency boundary. No seed or destructive
backfill is needed.

## Related decisions and unresolved questions

- Architecture: `aidlc/aidlc-docs/adr/0001-project-architecture.md`.
- Requirements: this unit's `requirements.md`.
- No material implementation question remains. G2 approval is required before code work resumes.
