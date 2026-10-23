# Episode form implementation plan

## Summary

- Builds: Ordered episode form with independent transcript, podcast script and audio sections.
- Touches: PodcastEpisodes collection, generation guidance/guards, related tests and generated Payload output.
- Tests: Approximately 10 targeted metadata/component regressions plus existing generation regressions and full-suite comparison.

## Approved scope and design

Source: ../../inception/requirements-analysis/requirements.md, FR1–FR5, NFR1–NFR3, AC1.1–AC6.3.
Use unnamed presentation groups and existing field definitions. Keep flat persistence, routes, hooks and access unchanged. Title and Channel precede Picture; transcript-only Create with AI precedes Generate podcast and separate Audio generation; details precede Featured. Shared manual editorial content follows Picture and precedes details/Featured; retain manual audio and transcript editors.
No migrations, seeds, providers or deployment changes. Alternative rejected: named groups or duplicate conditional field definitions would change persisted paths or introduce duplicate contracts.

## Impact and proposed diff

Medium impact: collection presentation consumed by Payload admin and metadata tests; grouping changes affect loading selectors. Generation controls and audio prerequisite hints consumed by component/pipeline tests. Generated types/import map may refresh from existing commands. Preserve required-at-action semantics without collection-wide required flags. Main files: src/collections/PodcastEpisodes.ts, src/components/admin/generate-transcript-field.tsx, src/components/admin/generate-script-field.tsx, src/components/admin/generate-audio-field.tsx, src/components/admin/generate-podcast-skeleton.css, src/pipeline/audio-button-state.ts. Touch endpoint guards only if inspection proves a gap in approved generation-time validation. Preserve unrelated work.

## Sequential steps

- [x] Step 1: Inspect relevant existing files/configuration and verify runner readiness; establish full existing test baseline and focused baseline before source edits. Record unavailable prerequisites and failures. Test configuration review is required; retain working configuration without speculative changes. (All requirements)
- [x] Step 2: Reorganize collection presentation using one authoritative field definition per stored path. Move Picture forward, split transcript/script/audio, move Summary/Main points to podcast content, relabel UV takes, preserve manual controls and align shared order, move details before Featured. Include required-for-generation indicators/guidance for genders and voice IDs without blocking drafts. (FR1, FR3, FR4, FR5)
- [ ] Step 3: Write/run collection layout and compatibility tests in tests/int/episode-form-order.int.spec.ts and update affected existing metadata tests. Cover AI/manual visibility, flat field identities, output order and optional-on-save inputs. (FR1, FR3, FR4, FR5)
- [x] Step 4: Update generation guidance, required input handling and any affected loading selectors; retain transcript-only action and existing endpoint guards/provider behavior. Use trimmed voice IDs and both genders for action prerequisites. Rename editor-facing opinion hints to UV takes. (FR2, FR3, FR4, NFR1, NFR3)
- [ ] Step 5: Write/run focused generation component and pipeline regressions after implementation. Extend existing tests for both valid inputs and missing/whitespace input cases, draft saving, failure and denied-access preservation. Update browser episode creation test for section order/responsive layout where practical. (FR2–FR5, NFR1–NFR3)
- [ ] Step 6: Run documented Payload generators when configuration inputs change; inspect generated diffs. Run lint, TypeScript, focused tests, full existing suite comparison and build. Attempt relevant browser checks; report missing database/browser prerequisites explicitly. (All requirements)
- [x] Step 7: Review changed code against SOLID/KISS/DRY/YAGNI and compatibility; write code-summary.md and traceability.json mapping every assigned requirement/acceptance criterion to actual paths and evidence. Record gaps honestly. (All requirements)

## Verification and rollback

See unit-test-instructions.md for scoped commands. Full baseline and post-change comparison additionally use pnpm test; pnpm lint, pnpm exec tsc --noEmit and pnpm build verify repository checks. Do not weaken failed checks. Restore this change's application diff to roll back; no stored-data migration is planned.

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

