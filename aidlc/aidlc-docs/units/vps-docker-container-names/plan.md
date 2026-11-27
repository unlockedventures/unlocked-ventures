# Plan: VPS Docker container names and automation context

Project: Unlocked Ventures

## Approach

Rename Compose services and set matching `container_name` values. Point Compose
`depends_on`, `DATABASE_URL` host, `TRANSCRIBER_URL`, and DB exec scripts at the new
names. Document VPS/AI deploy rules under `automation/` without changing pipeline code
paths that read env vars.

## Affected files and design

| Area                  | Proposed change and paths |
| --------------------- | ------------------------- |
| Compose               | `docker-compose.yml` — services `db`, `whisper`, `kokoro`, `app` + `container_name` |
| Config / docs         | `.env.example`, `README.md`, root/`aidlc` AGENTS pointers |
| Scripts               | `scripts/export-db.sh`, `scripts/import-db.sh` |
| Tests (fixtures only) | `tests/int/pipeline-request.int.spec.ts` endpoint strings → `whisper` |
| Automation            | `automation/AGENTS.md`, `CLAUDE.md`, `README.md`, `.cursor/rules/vps-deploy.mdc` |

## Content compatibility and rollout

No migrations. Operators with old named-volume stacks should migrate Postgres data into
`${UV_DATA_DIR}/postgres` (or keep using the same host path). Never `docker compose down -v`
if bind-mounted data must be kept — prune only containers/images after deploy.

## Generated outputs

- Payload schema changes: not applicable
- Admin import-map inputs: not applicable

## Failure handling and recovery

Misconfigured `DATABASE_URL` host (`postgres` leftover) will prevent app DB connect;
docs and `.env.example` use `db`.

## Verification strategy

- `docker compose config` for YAML validity and resolved names
- Grep for leftover Compose service targets (`exec -T postgres`, `@postgres:`,
  `http://transcriber`) in operator scripts/docs
- Tag script unit checks for `prod-yyyy.MM.n`; do not claim VPS runtime or rollback
  success unless executed on the VPS

## Operations impact

Exact container names for VPS monitoring. Assistants must read `automation/AGENTS.md`
before deploy edits.

## Related decisions and unresolved questions

User requested exact names and an `automation/` folder for Cursor/Claude deploy context.
