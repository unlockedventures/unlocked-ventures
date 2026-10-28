# Tasks: Editable Gemini generation prompts

Project: Unlocked Ventures

Gate progression: G1 approved. These tasks are proposed for G2. Implementation is prohibited until
explicit G2 approval; completed status is prohibited until G4 approval.

Statuses: `todo`, `in-progress`, `blocked`, `review`, `done`.

| ID  | Task                                                     | Status | Owner | Evidence or notes                   |
| --- | -------------------------------------------------------- | ------ | ----- | ----------------------------------- |
| T1  | Audit partial pre-gate changes against G1                | in-progress | Codex | Retain only compliant work after G2 |
| T2  | Add prompt fields and protected revision identities      | todo   | Codex | Nullable Payload fields             |
| T3  | Add compatibility SQL and additive migration             | todo   | Codex | Preserve existing content           |
| T4  | Implement Gemini prompt drafting and validation          | todo   | Codex | JSON prompt; sanitized errors       |
| T5  | Compose fixed contracts with editable briefs             | todo   | Codex | Fixed rules take precedence         |
| T6  | Add protected prompt endpoints and stale rechecks        | todo   | Codex | RBAC and lease retained             |
| T7  | Add Generate/Regenerate Prompt controls                  | todo   | Codex | Explicit replacement only           |
| T8  | Require current live prompts downstream                  | todo   | Codex | Missing/stale/oversized blocked     |
| T9  | Add focused provider, revision, endpoint and admin tests | todo   | Codex | Include denied access/preservation  |
| T10 | Generate Payload types and admin import map              | todo   | Codex | Project commands only               |
| T11 | Apply and verify development schema                      | todo   | Codex | No production action                |
| T12 | Update README and reconcile records for G3               | todo   | Codex | Actual checks and limits            |

## Completion checks

- [ ] Editable prompt workflow implemented with existing Payload/Gemini patterns.
- [ ] Existing transcripts, summaries, scripts and audio preserved.
- [ ] Fixed safety and output contracts remain server-controlled.
- [ ] Authorization, locking and stale-input checks enforced.
- [ ] Additive migration and rollout notes provided.
- [ ] Generated outputs created with project commands.
- [ ] Focused tests and relevant static checks recorded accurately.
- [ ] G3 explicitly approved after code review.
- [ ] G4 explicitly approved before final completion status.

## Handoff notes

### 2026-10-28 — Codex

- Completed: G1 approval and G2 planning artifacts.
- Next: Await explicit G2 approval before continuing implementation.
- Constraints: No application/schema/test changes are authorized before G2.
- Files touched: Feature records and previously requested `aidlc/` gate guidance.
- Checks run: Documentation formatting and `git diff --check`; no G2 implementation checks.
