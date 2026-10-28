# Tasks: <change name>

Project: Unlocked Ventures

Create this record in `units/<feature-slug>/` when feature work starts. Update progress throughout
implementation and reconcile tasks, acceptance criteria and actual verification before completion.
Keep tasks focused on authorized work.
Statuses: `todo`, `in-progress`, `blocked`, `review`, `done`.

| ID  | Task                                 | Status | Owner, if known | Evidence or notes                      |
| --- | ------------------------------------ | ------ | --------------- | -------------------------------------- |
| T1  | <specific change and affected paths> | todo   | <owner>         | <dependencies or acceptance criterion> |

## Completion checks

Use only applicable items; report limitations rather than claiming unrun checks passed.

- [ ] Requested behavior implemented with existing framework and brand patterns.
- [ ] Persisted editor content, slugs, routes and relationships preserved.
- [ ] Server-side authorization enforced for affected operations.
- [ ] Additive migration/compatibility SQL and rollout notes provided if schema changes require them.
- [ ] Required Payload types/admin import map generated using documented commands.
- [ ] Appropriate static checks, meaningful tests or manual checks completed as permitted by the task.
- [ ] Relevant documentation updated and remaining limitations recorded.

The current homepage menu-source change excludes automated tests; record generated outputs,
static checks and their limitations instead. No push, merge or deployment is implied by completion.

## Handoff notes, when needed

### <YYYY-MM-DD> — <person or tool, if known>

- Completed: <work and observed results>
- Next: <remaining authorized work>
- Constraints: <known issues, verification gaps and rollout prerequisites>
- Files touched: <repository paths>
- Checks run: <actual commands and outcomes; distinguish proposed checks>
