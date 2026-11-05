# Intent: Remove host/guest speaker gender

Project: Unlocked Ventures

- Status: done
- Ticket or issue: none provided

## Business goal

Podcast editors had to choose a host gender and a guest gender before generating a script, and
separately choose host and guest Kokoro voices before generating audio. Gender affected only the
script prompt and a `speakers.gender` value in the script JSON that nothing else reads; audio is
driven entirely by the selected Kokoro voice, whose ID already encodes gender (`af_`/`bf_` female,
`am_`/`bm_` male). The two selections could also contradict each other. Remove gender so the
Kokoro voice is the single speaker setting.

## Users and stakeholders

Podcast producers and content editors using AI episode generation in the Payload admin.

## Scope

- Included: hide the gender selects, remove gender requirements from script/prompt buttons and
  endpoints, remove gender from Gemini prompts and the script JSON shape, update the
  script-prompt revision, update affected tests.
- Excluded: database column removal, Kokoro voice selection behavior, audio generation.

## Affected areas

`src/collections/PodcastEpisodes.ts`, `src/components/admin/generate-script*-field.tsx`,
`src/components/admin/generate-podcast-skeleton.css`, `src/pipeline/` (script schema, script
generation, editor prompts, prompt revision, script run handler, AI endpoints), related tests.

## Constraints

Additive migrations only: keep `host_gender`/`guest_gender` columns and stored values. Previously
saved scripts containing `speakers.*.gender` must still parse.

## Success criteria

- Editors no longer see gender fields and can generate prompts and scripts without them.
- Existing episodes and saved scripts continue to load, sync and generate audio.

## Risks and open questions

- The script-prompt revision no longer includes gender, so prompts saved before this change are
  reported as out of date once and must be regenerated before the next script generation.
