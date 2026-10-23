# Code Quality Assessment

## Observed Verification Surface
Vitest tests cover picture controls, create-mode bootstrap, saving video links, script prerequisites and audio prerequisites. Playwright covers authenticated AI/manual creation and image input visibility. No tests were executed during this read-only scan; coverage percentages and CI enforcement are unknown.

## Relevant Checks
Use pnpm test:int for the integration/component suite; pnpm test:e2e for browser checks; pnpm lint; pnpm exec tsc --noEmit; pnpm build. Add focused form-order/grouping verification against collection metadata and essential browser order. Browser checks require installed browsers, a running/configured application and ADMIN_E2E_EMAIL/ADMIN_E2E_PASSWORD; database checks require configured PostgreSQL. Do not run seeds for this presentation change.

## Risks and Gaps
Existing picture tests search root fields, so preserve flat configuration or deliberately adapt traversal while testing the same behavior. Summary/mainPoints are shared by manual and AI editors: moving them must not accidentally remove manual access or duplicate storage definitions. Transcription skeleton CSS references field IDs across the whole form. The old opinion wording exists in audio guidance/tests and should align with UV takes. Exact placement of preserved gender and voice/audio controls is a requirements decision; suggested home is Generate podcast. No migration is anticipated if grouping remains unnamed and field contracts are unchanged.
