# Decision and Change Log: Editable Gemini generation prompts

Project: Unlocked Ventures

Record every G1–G4 request, approval, rejection, and revision. Never infer a gate approval.

| Date       | Actor, if known | Type     | Summary and scope                                                                                                 | Evidence or link            |
| ---------- | --------------- | -------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 2026-10-28 | User            | Decision | Add Gemini-generated but editor-modifiable prompts for source-summary and podcast-script generation.              | Conversation request        |
| 2026-10-28 | User            | Decision | Use explicit Generate Prompt and Regenerate Prompt actions.                                                       | Conversation request        |
| 2026-10-28 | User            | Decision | Enforce G1 requirements, G2 planning, G3 coding and G4 feature-status approval gates in the root `aidlc/` method. | Conversation request        |
| 2026-10-28 | Codex           | Change   | Updated `aidlc/` guidance and templates to require explicit, feature-scoped G1–G4 approvals.                      | `aidlc/AGENTS.md`, docs     |
| 2026-10-28 | Codex           | Audit    | Partial code was started before gates were requested; coding is paused and that work has not passed G1, G2 or G3. | Working tree inspection     |
| 2026-10-28 | Codex           | Gate     | Presented editable Gemini prompt intent and requirements for G1 review; awaiting explicit approval.               | `intent.md`, this record    |
| 2026-10-28 | User            | Approval | Approved G1 requirements analysis for editable Gemini prompts.                                                    | Conversation: “g1 approved” |
| 2026-10-28 | Codex           | Gate     | Began G2 planning artifacts after G1 approval; coding remains paused pending explicit G2 approval.                | `plan.md`, `tasks.md`       |
| 2026-10-28 | User            | Approval | Approved G2 implementation plan for editable Gemini prompts.                                                      | Conversation: “g2 approved” |
| 2026-10-28 | Codex           | Gate     | Began G3 coding and verification after G2 approval.                                                               | Working tree               |

## Verification details

G1 is documentation-only. Application code, schema, generated outputs and tests are not approved
for continuation until G1 and G2 are explicitly approved. No database command was run for this
feature.
