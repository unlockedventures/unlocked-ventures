# Requirements: <change name>

Project: Unlocked Ventures

Gate: G1 — Requirements analysis. Do not begin planning until the user explicitly approves G1.

Create this record in `units/<feature-slug>/` before feature implementation and maintain it as
requirements evolve. Keep requirements specific to the task;
remove irrelevant prompts and do not introduce new scope.

## Functional requirements

- FR-1: <Describe observable behavior and the affected page, collection, global or endpoint.>

## Content and compatibility

<Identify editable Payload fields, existing consumers, routes, relationships and stored content
that must be preserved. For menu inheritance, use stable parent/group IDs and keep header
visibility independent of homepage reuse. Describe any additive schema rollout requirements.>

## Authorization and data protection

<Identify actors and server-side permissions, including custom endpoints and Local API calls.
Preserve restricted account/role administration and the contact route ingestion boundary.
Do not include real personal data or credentials.>

## Quality requirements

<Specify applicable accessibility, responsive behavior, performance, failure handling and
operational visibility with measurable criteria where known. Do not invent service targets.>

## Acceptance criteria

- AC-1: Given <initial state and actor>, when <action>, then <observable result>.
- AC-2: <Relevant denied-access, invalid-input, missing-content or failure behavior.>

## Open questions

Ask only when a material requirement cannot reasonably be resolved from context.

| ID  | Question                    | Answer or evidence | Status             |
| --- | --------------------------- | ------------------ | ------------------ |
| Q1  | <material question, if any> | <answer or source> | <open or resolved> |

## Assumptions

- <Assumption, validation status and supporting source when available.>

## Verification constraints

<Record task-specific instructions. The current homepage menu-source change excludes automated
tests; generate required outputs and report static checks and limitations for that change.
Do not treat that preference as a blanket restriction on other tasks.>
