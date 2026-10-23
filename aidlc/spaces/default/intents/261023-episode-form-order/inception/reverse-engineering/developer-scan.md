## Developer Code Scan Results

### Scan Coverage
- **Analyzed deeply**: `src/collections/PodcastEpisodes.ts`; `src/components/admin/generate-transcript-field.tsx`; `src/components/admin/generate-script-field.tsx`; `src/components/admin/generate-audio-field.tsx`; `src/components/admin/generate-podcast-skeleton.css`; `src/pipeline/episode-ai-endpoints.ts`; `src/pipeline/apply-ai-content.ts`; `src/pipeline/run-generate-script.ts`; `src/pipeline/script-button-state.ts`; `tests/int/episode-picture-fields.int.spec.ts`; `tests/int/episode-editor-mode.int.spec.tsx`; `tests/int/pipeline-script-button.int.spec.ts`; `tests/int/pipeline-audio-button.int.spec.ts`; `tests/int/transcript-save-links.int.spec.tsx`; `tests/e2e/episode-create-mode.e2e.spec.ts`; `package.json`; `README.md`.
- **Skimmed only**: remaining `src/` and `tests/` structure.
- **Left out**: dependencies, caches, generated assets, build outputs, AI-DLC installation/workspace source, unrelated infrastructure and application features. Generated Payload types were listed but not opened.

### Packages Found
- Single TypeScript application: Next.js site and Payload content portal; podcast pipeline is an internal module.

### Build System
- **Type**: pnpm scripts; Next.js build, Payload generators.
- **Config Files**: package.json inspected; framework/tool configuration outside snapshot not inspected.
- **Build Dependencies**: React components depend on Payload UI; collection depends on pipeline adapters.

### APIs Discovered
- Four custom episode endpoints: POST transcribe, GET progress, POST generate-script, POST generate-audio; see published api-documentation.md.

### Frameworks & Libraries
- Next.js 16.3.3, React 19.2.6, Payload 3.90.2, TypeScript 5.7.3; see technology-stack.md.

### Test Coverage
- **Test Directories**: tests/int and tests/e2e.
- **Test Frameworks**: Vitest, Testing Library, Playwright.
- **Coverage Config**: outside focused read scope; no measured coverage or test execution claimed.

### Code Quality Indicators
- **Linting**: package script uses ESLint; exact configuration not inspected.
- **CI/CD**: not inspected; no enforcement claim.
- **Documentation**: README covers setup, schema compatibility, pipeline tracking and permissions.

### Technical Debt Signals
- Form mixes transcript/script/audio under one Create with AI collapsible while Summary/Main points sit elsewhere.
- Generate audio hint tests still assert System overall opinion terminology; field rename must consider user-facing hints without renaming storage.
- GenerateScriptField toggles form-wide CSS hiding specific field IDs during transcription; preserve selectors and loading behavior when regrouping.

## Handoff Summary
- **Intent-relevant finding**: PodcastEpisodes.fields defines Channel before Title, Featured before Guest/topic/duration, then Picture. Its Create with AI block includes transcript, script and audio controls; About this episode owns summary/mainPoints. Transcript and script backend operations are already separate.
- **Risks / follow-up**: Preserve flat persisted fields, conditions, relationships, sidebar job state and defaults. Recommended home for existing gender/voice/audio controls is Generate podcast; confirm in requirements. Manual mode shares summary/mainPoints and picture fields: avoid duplicate field definitions, and preserve its workflow. No application edits or test runs performed.
