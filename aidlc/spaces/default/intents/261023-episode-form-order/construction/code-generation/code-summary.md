# Episode form implementation

## Changes

AI episodes now show Title, Channel, Picture, transcript-only Create with AI, Generate podcast, Audio generation, Guest/topic/duration, and Featured in that order. Script outputs follow Summary, script.json, Main points, Contrasting points, Disagreement points, UV takes. Both genders precede the script button; both ElevenLabs voice IDs precede the audio button. Their labels and descriptions explain the generation requirement without adding collection-level required flags.

PodcastEpisodes.ts retains one definition per stored field and uses unnamed collapsibles, preserving flat persistence. A small EpisodePodcastLabel component observes editorMode through useFormFields and labels the shared content section Generate podcast in AI mode and About this episode in manual mode. Manual content, audio and transcript editors remain available before details and Featured. Generation controls remain AI-only. Existing endpoints, provider algorithms, access, hooks, relationships and public field names are unchanged.

The audio click guard now respects a live input that was cleared or contains only whitespace instead of falling back to a stale saved voice ID. Existing gender and voice-ID action guards remain in place. Transcript guidance reflects Picture's earlier position; audio guidance uses UV takes. The script skeleton follows Summary/script output order, and no longer hides voice inputs belonging to the separate audio section.

## Files

- src/collections/PodcastEpisodes.ts: section order, mode conditions, required-at-action guidance, UV takes.
- src/components/admin/episode-podcast-label.tsx: mode-aware heading for shared editorial fields.
- src/components/admin/generate-audio-field.tsx: live blank voice-ID handling.
- src/components/admin/generate-script-field.tsx and generate-podcast-skeleton.css: loading presentation.
- src/pipeline/button-state.ts and audio-button-state.ts: updated editor guidance.
- src/payload-types.ts and src/app/(payload)/admin/importMap.js: Payload-generated field order and label registration.
- tests/int/pipeline-button.int.spec.ts, pipeline-audio-button.int.spec.ts and transcript-save-links.int.spec.tsx: existing literal expectations updated for changed wording; not executed after changes.

## Verification evidence and limitations

Before source edits, the approved focused command passed all 32 tests across five files. Baseline `DATABASE_URL=postgresql://localhost:1/episode_form_verification pnpm test` recorded 160 passing tests, three failures, one skipped database test, and two unhandled rejections across 29 files. Frontend-error lacked QueryClientProvider; not-found/site-layout had async rendering failures. The database-dependent suite could not initialize against the intentionally unreachable address. This protected populated databases from Payload onInit seeds; it is an unavailable isolated database prerequisite, not evidence of a database regression. The full test command stopped before Playwright.

After baseline collection the user explicitly said “no need of testing”, then requested completion. No new tests, post-change test executions, lint, type check, build or browser checks were run. All changed behavior, responsive layout, round-trip persistence and unchanged generation behavior remain unverified by execution. Existing baseline results are not post-change evidence. Existing test wording was updated only; no additional test cases were introduced. The plan's uncompleted test/verification checkboxes remain unchecked because those steps were waived, rather than falsely marked complete.

Required commands `pnpm generate:types` and `pnpm generate:importmap` completed successfully. Source inspection of Payload's CLI confirmed these commands load configuration without calling getPayload/onInit, so no seeds, migrations or providers ran. Generated diffs retain flat field paths; changed type positions follow field ordering and the import map includes EpisodePodcastLabel. Generators are not tests and do not establish runtime correctness.

## Design review and deviations

Source review kept shared definitions authoritative, reused existing Payload conditions and generation components, and introduced only the small label component needed to present the same stored fields in both modes. No speculative abstractions or migration were added. Audio prerequisite behavior changes only for cleared live voice inputs. The dynamic label resolves the requirement to share editorial fields while keeping AI section terminology out of manual mode.

The user waived the plan's additional tests and verification after the pre-change baseline. Those steps were not executed, and acceptance mappings distinguish implementation paths from unverified runtime outcomes. Rollback consists of restoring this change's application and generated files; no data migration is involved.
