# Requirements: Editable Gemini generation prompts

Project: Unlocked Ventures

Gate: G1 — Requirements analysis. Do not begin planning until the user explicitly approves G1.

## Functional requirements

- FR-1: After all current video transcripts are complete, an authorized editor shall have a
  Generate Prompt action for the source-summary stage.
- FR-2: Gemini shall generate a proposed source-summary editorial brief without generating the
  summary itself.
- FR-3: The proposed source-summary prompt shall be stored in an editable textarea and remain
  unchanged until the editor edits it or explicitly selects Regenerate Prompt.
- FR-4: The action label shall become Regenerate Prompt when a source-summary prompt exists.
- FR-5: Generate Source Summary shall require a nonblank prompt that is current for the active
  source revision and shall use the editor's live textarea value.
- FR-6: After a current editable source summary and valid host/guest settings exist, an authorized
  editor shall have a Generate Prompt action for the podcast-script stage.
- FR-7: Gemini shall generate a proposed podcast-script editorial brief without generating the
  script itself.
- FR-8: The proposed podcast-script prompt shall be stored in an editable textarea and remain
  unchanged until edited or explicitly regenerated.
- FR-9: The action label shall become Regenerate Prompt when a podcast-script prompt exists.
- FR-10: Generate Podcast Script shall require a nonblank prompt current for the exact source-summary
  text and host/guest settings and shall use the editor's live textarea value.
- FR-11: Source transcript/revision changes shall mark the summary prompt stale without deleting it.
- FR-12: Source-summary text or host/guest setting changes shall mark the script prompt stale without
  deleting it.
- FR-13: Fixed grounding, untrusted-source handling, required JSON shapes, speaker identifiers and
  output validation shall remain server-owned and shall not be editable in the prompt fields.
- FR-14: Prompt generation failures shall preserve the existing prompt and all generated content.
- FR-15: Summary or script generation failures shall preserve the current prompt and prior outputs.

## Content and compatibility

Add optional fields to existing `podcast-episodes` records for the two prompts and their input
revision identities. Existing records remain valid with empty prompts; their existing summaries,
scripts and audio are not regenerated or cleared. Editors must generate prompts before the next
summary/script regeneration. Prompt text is editorial content and may be saved normally; revision
identity fields are server-controlled.

## Authorization and data protection

- Require authenticated `podcast-episodes` read and update permission for both prompt-generation
  endpoints and both downstream generation endpoints.
- Keep Gemini credentials, fixed system requirements and provider errors server-side.
- Treat transcripts and source summaries as untrusted data, clearly separated from instructions.
- Bound prompt length and return sanitized validation/provider errors.
- Preserve the shared generation lease so prompt, summary, script and audio operations cannot
  conflict on the same episode.

## Quality requirements

- Prompt fields and actions must be keyboard accessible and fit the existing Payload admin layout.
- Do not overwrite editor-modified prompts automatically.
- Stale-state messages must identify which upstream input changed and direct the editor to review or
  regenerate the prompt.
- Revision calculations must be deterministic in browser and server contexts.
- Provider output must be validated as JSON with a nonblank `prompt` string.

## Acceptance criteria

- AC-1: Given completed current transcripts and no summary prompt, when Generate Prompt succeeds,
  then an editable proposed prompt is displayed and the action becomes Regenerate Prompt.
- AC-2: Given an editor changes that prompt, when Generate Source Summary is selected, then Gemini
  receives the edited brief while fixed server requirements remain applied.
- AC-3: Given source inputs changed, when summary generation is attempted with the old prompt, then
  generation is blocked and the old prompt is retained for review.
- AC-4: Given a current summary and speaker settings, when Generate Prompt succeeds in the podcast
  stage, then an editable script brief is displayed and the action becomes Regenerate Prompt.
- AC-5: Given an editor changes the script brief, when Generate Podcast Script is selected, then the
  edited brief drives generation and the returned script still passes the existing schema validator.
- AC-6: Given the summary text or either speaker setting changes, when script generation is attempted
  with the old prompt, then generation is blocked without deleting the prompt or prior script.
- AC-7: Given an unauthorized user, when either prompt endpoint is requested, then server-side access
  is denied.
- AC-8: Given Gemini returns invalid JSON, an empty prompt, or an unavailable response, then the
  editor receives a sanitized error and persisted content is unchanged.

## Open questions

No material questions remain. Explicit actions, editable prompts, regeneration behavior and fixed
server guardrails were resolved by the user's instructions and the current pipeline constraints.

## Assumptions

- “Prompt” means an editable editorial brief, not the complete fixed provider instruction.
- Regenerate Prompt intentionally replaces the current prompt only after the editor clicks it.
- Prompt generation uses the configured Gemini model and existing provider credentials.
- Existing source-summary and script outputs are retained until their respective generation action
  succeeds.

## Verification constraints

Focused automated tests are appropriate for this podcast-admin feature. Database schema commands
may be applied only to the configured development Docker database after G2 authorizes coding.
