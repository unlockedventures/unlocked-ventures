# Requirements: Remove host/guest speaker gender

Project: Unlocked Ventures

## Functional requirements

- FR-1: The Podcast Episodes admin no longer displays Host gender or Guest gender.
- FR-2: Generate Prompt and Generate Podcast Script do not require or send gender.
- FR-3: `/generate-script-prompt` and `/generate-script` do not require, validate or save gender.
- FR-4: Gemini script and editor-prompt requests contain no gender instructions; script JSON
  speakers contain only `role`.
- FR-5: The script-prompt revision depends only on the source summary.

## Content and compatibility

- `hostGender`/`guestGender` remain in the schema (hidden) so stored values and columns are kept;
  no migration is needed.
- Stored scripts with `speakers.*.gender` still parse; the extra value is ignored.

## Authorization and data protection

Unchanged: endpoints keep their existing authentication and RBAC checks.

## Acceptance criteria

- AC-1: Given an AI episode with a current source summary and no gender set, when an editor
  generates a prompt and then a script, then both succeed without a gender message.
- AC-2: Given a saved script whose speakers include `gender`, when it is parsed for sync or audio
  generation, then parsing succeeds.
- AC-3: Given the episode edit form, then no gender select is visible.

## Assumptions

- Gender has no consumer beyond the prompt and script JSON (verified by repository search).

## Verification constraints

No task-specific verification instruction was given. Run type check, lint and the affected
integration tests where available.
