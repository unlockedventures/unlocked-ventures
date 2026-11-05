# Decision and Change Log: Remove host/guest speaker gender

Project: Unlocked Ventures

| Date       | Actor       | Type         | Summary and scope | Evidence or link |
| ---------- | ----------- | ------------ | ----------------- | ---------------- |
| 2026-11-04 | User        | decision     | Chose full removal of speaker gender (over hiding with defaults), on branch `feature/enhance-kokoro-voice-feature`. | Conversation |
| 2026-11-04 | Claude Code | decision     | Keep `hostGender`/`guestGender` fields hidden instead of deleting, to preserve columns and stored values without a migration. | Root AGENTS.md additive-migration rule |
| 2026-11-04 | Claude Code | decision     | Bump script-prompt revision to `v2` (summary only); existing saved prompts must be regenerated once. | `src/pipeline/prompt-revision.ts` |
| 2026-11-04 | Claude Code | change       | Removed gender from pipeline, endpoints, admin fields, CSS and tests; regenerated Payload types. | `git diff` (18 files) |
| 2026-11-04 | Claude Code | verification | 35 affected Vitest tests passed; tsc errors only in untouched files; ESLint not runnable; e2e not run. | tasks.md handoff |
