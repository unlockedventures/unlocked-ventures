# Unlocked Ventures — Supporting Documentation

This directory contains feature records and supporting project documentation. Every new feature
gets a folder under `units/` when work starts, maintained through completion. Every feature must
pass the four approval gates below. Follow the repository-root working agreement and the more
specific current user instruction when it explicitly requires these gates.

## Mandatory approval gates

| Gate | Review artifact                                    | Work allowed only after explicit approval                    |
| ---- | -------------------------------------------------- | ------------------------------------------------------------ |
| G1   | `intent.md`, `requirements.md`                     | Write the implementation plan and tasks                      |
| G2   | `plan.md`, `tasks.md`                              | Change application code, schema, tests, or generated outputs |
| G3   | Implemented code and verification evidence         | Finalize feature status and completion records               |
| G4   | Reconciled status proposal across all five records | Mark the feature and tasks complete                          |

At each gate, show the relevant artifact summary, identify open issues, ask for approval by gate
name, and stop. Accept approval only when the user explicitly names or unmistakably approves that
gate for the current feature. Record the request and decision in `audit.md`. If the user requests a
revision, update the applicable artifacts and present the same gate again. Never treat “proceed” by
itself as approval for an unnamed gate.

## Start here

- [Repository instructions](../../AGENTS.md): working agreement, CMS safety and menu inheritance.
- [Project README](../../README.md): setup, scripts, schema rollout, podcast workflows and RBAC.
- [Supporting project guidance](../AGENTS.md): code map, commands and implementation conventions.

All code paths and shell commands in supporting guidance are relative to the repository root.
Run development commands there, not in this documentation directory.

## Feature folder structure

```text
units/<feature-slug>/
├── intent.md
├── requirements.md
├── plan.md
├── tasks.md
└── audit.md
```

Copy the five matching files from `templates/` and replace prompts with feature-specific content.
Use a descriptive kebab-case slug; include a ticket prefix only when a real key is provided.
Reuse the same folder for continued work on a feature. Draft intent, requirements and plan before
implementation, maintain task progress and append factual audit entries throughout the work.
Before completion, reconcile acceptance criteria, record actual verification and limitations,
and mark the intent and tasks accordingly. Keep records concise and proportional to the feature.

Standalone maintenance and documentation updates do not require new feature folders. Do not
backfill past features unless requested. Architecture decisions belong separately in `adr/` when
requested or within the task scope; they are not a sixth mandatory feature file.

## Documentation practices

- Document the actual Next.js/Payload/PostgreSQL application and verify claims against source.
- Maintain all five records for each new feature. Add other decisions or runbooks when the task
  calls for them.
- Prefer updating the existing root README for setup and operational behavior rather than creating
  conflicting copies. Keep the root AGENTS.md authoritative for working rules.
- Include affected paths, behavioral changes, additive migration prerequisites and verification
  limitations when relevant. Separate intended behavior from behavior actually verified.
- Preserve existing documentation and other contributors' work. Treat historical records as
  context that may no longer describe current implementation.
- Do not store credentials, production data, invented approvals or unsupported infrastructure claims.

Do not invent active features, tracker conventions, deployment targets or gate approvers.

## Using another AI tool

Open the repository root as the workspace. Root `AGENTS.md` is the shared source
of instructions. Tool entry points are available in root `CLAUDE.md`, `GEMINI.md`,
`.github/copilot-instructions.md` and `.cursor/rules/project.mdc`.
Keep instruction loading enabled in the tool and check its loaded context when
available. These files cannot guarantee that every AI tool reads or obeys them.

For other tools or chat-only sessions, provide this starting prompt and make the
referenced files available:

> Read AGENTS.md, README.md and aidlc/AGENTS.md before making changes. Follow the
> feature-record workflow in AGENTS.md. For an existing feature, read and update
> its unit folder. Report actual verification results and remaining limitations.

Review feature records alongside code before accepting a completed feature.
Runtime checks and code review remain necessary; instruction files alone do not
enforce security, correctness or documentation completeness.
