# Intent: Editable Gemini generation prompts

Project: Unlocked Ventures

- Status: active
- Gate status: awaiting G3
- Ticket or issue: Not provided
- Owner: Not assigned

## Business goal

Give podcast editors control over the editorial instructions Gemini uses for source-summary and
podcast-script generation. Gemini proposes each prompt first; editors can review and modify it
before asking Gemini to generate the corresponding content.

## Users and stakeholders

- Podcast editors using Create with AI.
- Administrators operating the Gemini-backed generation pipeline.
- Public podcast visitors, who consume only editor-approved generated content.

## Scope

- Included: explicit Generate Prompt and Regenerate Prompt actions for source summaries and podcast
  scripts; editable stored prompt fields; prompt freshness tracking; use of the editor's current
  prompt during generation; server-side grounding, safety and JSON contracts; additive persistence,
  admin guidance, authorization, tests and rollout documentation.
- Excluded: changing Gemini provider/model selection; exposing fixed safety/schema instructions;
  automatic prompt generation without editor action; prompt version history beyond the current
  stored prompt; changing transcript, Kokoro audio or public playback behavior.

## Affected areas

- `src/collections/PodcastEpisodes.ts`
- `src/components/admin/generate-source-summary-field.tsx`
- `src/components/admin/generate-script-field.tsx` and new prompt-action controls
- `src/pipeline/generate-source-summary.ts`, `generate-script.ts`, prompt generation and revisions
- `src/pipeline/episode-ai-endpoints.ts`
- Additive PostgreSQL compatibility SQL/migration and generated Payload outputs
- Focused prompt and pipeline tests, README, and this feature unit

## Constraints

- Preserve existing transcripts, summaries, scripts, audio and public episode relationships.
- Editable text is an editorial brief; fixed grounding, untrusted-data handling, JSON shape and
  script validation remain server-controlled and take precedence.
- Enforce episode read/update permission on every custom endpoint and preserve the shared generation
  lease and stale-source checks.
- Never silently replace a modified prompt. Replacement occurs only through Regenerate Prompt.
- Source changes and relevant script inputs must make an older prompt visibly stale.
- Use additive schema changes and regenerate Payload outputs with project commands.

## Success criteria

- An authorized editor can explicitly generate, edit and regenerate a source-summary prompt.
- Source-summary generation uses the current editable prompt plus fixed server requirements.
- An authorized editor can explicitly generate, edit and regenerate a podcast-script prompt.
- Script generation uses that prompt while retaining schema validation and speaker settings.
- Stale or missing prompts block the corresponding content-generation action with useful guidance.
- Existing generated content remains intact during prompt creation, editing and provider failures.

## Risks and open questions

- Gemini prompt generation adds one provider call before each content-generation stage.
- Very long editable prompts require a bounded server-side length to avoid excessive provider input.
- Partial implementation began before gates were requested; it is paused and is not approved code.
