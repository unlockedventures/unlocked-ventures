# Episode form test instructions

## Runner and scope

Existing Vitest/Testing Library and Playwright setup; inspect vitest.config.mts and playwright.config.ts before running. Preserve configuration unless a concrete requirement needs a change.
Exact focused runner command:
`pnpm exec vitest run --config ./vitest.config.mts tests/int/episode-picture-fields.int.spec.ts tests/int/episode-editor-mode.int.spec.tsx tests/int/pipeline-script-button.int.spec.ts tests/int/pipeline-audio-button.int.spec.ts tests/int/transcript-save-links.int.spec.tsx`

After adding the layout regression:
`pnpm exec vitest run --config ./vitest.config.mts tests/int/episode-form-order.int.spec.ts tests/int/episode-picture-fields.int.spec.ts tests/int/episode-editor-mode.int.spec.tsx tests/int/pipeline-script-button.int.spec.ts tests/int/pipeline-audio-button.int.spec.ts tests/int/transcript-save-links.int.spec.tsx`

Scoped browser command:
`pnpm exec playwright test --config=playwright.config.ts tests/e2e/episode-create-mode.e2e.spec.ts`

## Acceptance coverage

FR1/FR5: actual field sequence and manual conditions; FR3: requested output sequence and UV takes label with unchanged storage; FR2: transcription does not invoke script/audio; FR4: valid genders/voice IDs, missing either value and whitespace voice IDs, draft save without generation inputs. NFR1: preserve authorization/flat schema; NFR2: accessible labels and browser viewport checks; NFR3: preserve request/polling behavior. Include stable AC references in test names/nearby comments. Approximately 10 targeted additions; at least one test per requirement and happy path per changed component, plus two meaningful edge/error cases per test file as applicable.

## Fixtures, mocks and targets

Use existing Payload metadata and UI mocks. Stub provider/network boundaries, never real paid generation calls. Preserve representative saved AI/manual field values. Use existing authentication/browser fixtures and document database/browser prerequisites. No destructive seeds against populated databases. Test-after ordering per Testing Contract; no numeric coverage floor added by this scope. Keep existing suite green and report reproducible pre-existing failures separately.

