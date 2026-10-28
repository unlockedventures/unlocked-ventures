# Plan: <change name>

Project: Unlocked Ventures

Gate: G2 — Planning. Create only after G1 approval. Do not begin coding until the user explicitly
approves G2.

Create this record in `units/<feature-slug>/` before feature implementation and update it when
the approach changes. Keep it proportional to the change. This template does not
require separate approval before implementing authorized work.

## Approach

<Describe the problem, proposed implementation and resulting behavior.>

## Affected files and design

| Area                  | Proposed change and paths                                                    |
| --------------------- | ---------------------------------------------------------------------------- |
| Public site           | <App Router pages, site components and content loaders, if affected>         |
| CMS and admin         | <Payload collections/globals, editor controls and guidance, if affected>     |
| Server and access     | <RBAC, custom endpoints, public routes or Local API operations, if affected> |
| Data and integrations | <PostgreSQL schema, migrations, podcast providers or SMTP, if affected>      |

Remove unaffected rows. Reuse existing patterns, UI components and brand assets.

## Content compatibility and rollout

<Explain preservation of slugs, routes, relationships and existing editor content. Identify
additive migrations under `src/migrations/`, compatibility SQL under `scripts/`, and the target
rollout sequence. Inspect startup seeds/backfills before running them on populated databases.
Do not use destructive seeds to establish homepage menu associations.>

## Generated outputs

- Payload schema changes: <whether `pnpm generate:types` is required>
- Admin import-map inputs: <whether `pnpm generate:importmap` is required>

Do not hand-edit generated files. Mark items not applicable where appropriate.

## Failure handling and recovery

<Describe relevant validation errors, missing content, provider timeouts, partial results,
generation leases and recovery. Preserve saved content; distinguish code rollback from database
changes that remain in place.>

## Verification strategy

<List appropriate lint/type checks, meaningful tests and manual checks. Respect task-specific
instructions, including no automated tests for the current homepage menu-source change.
Identify database/browser prerequisites and avoid database operations for documentation changes.>

## Operations impact

<Document configuration names without secrets, migration prerequisites, service changes and
README/runbook updates. Push, merge and deployment require user authorization.>

## Related decisions and unresolved questions

<Link relevant ADRs or requirements. Record actual decisions and remaining material unknowns;
do not fabricate approval records.>
