# Episode source-summary implementation plan

## Summary

- Builds: Separate editable source summary between all-video transcription and podcast generation.
- Touches: Episode collection/admin, summary/script pipeline, additive schema/migration and generated Payload outputs.
- Tests: Further checks omitted at user request; runtime acceptance unverified.

## Scope and approach

Approved requirements revision: FR1–FR6, NFR1–NFR3, AC7.1–AC7.7. Preserve previous ordering work. Add distinct source-summary text, status/detail and source-revision metadata, retaining existing episode Summary output. New independent action summarizes all completed video transcripts; podcast input is only the current editable source summary. No raw-transcript fallback. Existing episodes must generate a summary before generating another podcast.
Use existing Gemini configuration and RBAC. Source identity derives from video URLs/transcripts and combined source text, never a client-supplied trusted revision. Reject incomplete sources, stale output and conflicting work; preserve prior text on failures. Include saved editor changes in script input. Prefer small cohesive helpers and operation handlers over generic frameworks.

## Impact and rollout

New additive persisted columns and endpoint plus changed script prerequisite. Inspect Payload hooks, boot SQL and migrations before editing; add idempotent schema scripts/migration consistent with current patterns. Never run schema scripts, migrations, seeds or paid AI requests. Preserve stored content and unrelated edits. Rollback restores code while leaving additive data columns intact. Existing manual mode is unaffected.

## Steps

- [x] Step 1: Inspect pipeline, controls, permissions, migrations and initialization. Record affected paths; no additional baseline/test commands.
- [x] Step 2: Add source-summary fields, section/button, protected revision/status metadata and editable content; preserve prior form order and hide in manual mode. (FR1, FR6)
- [x] Step 3: Implement completeness/source identity helper, Gemini summarizer and authorized endpoint using existing patterns. Reject duplicates/conflicting work and stale results; preserve summary on errors. (FR6, NFR1, NFR3)
- [x] Step 4: Change script server/UI prerequisites to current source summary, explicitly persist/submit edits, update prompt/input wording, and invalidate summary identity on source edits without deleting content. Keep previous script/audio contracts. (FR2–FR4, FR6)
- [x] Step 5: Add registered additive migration and boot SQL wiring, regenerate Payload types/import map and document rollout in README. Do not execute database mutations. (FR6, NFR1)
- [x] Step 6: Review source, update code-summary.md and traceability.json mapping actual paths and unverified acceptance; document compatibility, rollback and user test waiver. No tests/lint/typecheck/build/browser runs. Existing fixtures may be maintained without execution. (All requirements)

## Verification waiver

The original Testing Contract remains below for audit. The user's subsequent explicit instruction 'no need of testing' overrides further execution. No new tests, verification runs or claims of passed behavior. Required safe code generators and source inspection remain allowed.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "org",
  "ordering": "implement each applicable testable layer, then write and run that layer's tests.",
  "scope": "express",
  "test_strategy": "minimal",
  "project_type": "brownfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    }
  ],
  "obligations": {
    "strategy": "minimal",
    "strategy_volume": [
      "One verifiable test per requirement at the narrowest effective level.",
      "At least one happy-path unit test per component.",
      "Unit tests are the default; a bugfix/security scope floor may require an integration or E2E regression when that is the narrowest level that reproduces the defect."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Verify the existing test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Verify the existing test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:c8f84e35190e007d9863fad236154d0269ab9bf633fc2a3ff106ed965ba4a9b9",
  "contract_sha256": "sha256:bb76c1b22f8307be6e5780d50cabab891684449d5b164bd0e825e9e4e5c61e5b"
}
```

