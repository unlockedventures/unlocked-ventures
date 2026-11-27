# Intent: VPS Docker container names and automation context

Project: Unlocked Ventures

- Status: done
- Ticket or issue: none
- Owner: user request (VPS deploy preparation)

## Business goal

Operators deploying this repo on a VPS need stable, exact Docker container names
(`db`, `app`, `whisper`, `kokoro`) for monitoring and scripts, plus a dedicated
`automation/` folder so Cursor and Claude keep deploy guidance in one place
without changing podcast/CMS business logic. Secrets are injected from GitHub
Actions or Jenkins (not committed `.env`); ignore files and `README.DOCKER.md`
must stay clean for that workflow.

## Users and stakeholders

- Operators and assistants performing Docker / VPS deployment
- Developers using Compose locally

## Scope

- Included: Compose service/`container_name` alignment; env and script host
  updates; README/AGENTS pointers; `automation/` AI deploy context; clean
  `.gitignore` / `.dockerignore`; `README.DOCKER.md` for Actions/Jenkins secrets
- Excluded: committing real pipeline YAML with live secrets; reverse-proxy/TLS;
  Kubernetes; Payload schema changes; renaming `transcriber/` source tree

## Affected areas

- `docker-compose.yml`, `.env.example`, export/import scripts, README
- Root and aidlc AGENTS pointers
- `automation/` deploy AI context
- Test fixtures that used Compose DNS strings for the transcription endpoint

## Constraints

- Do not alter generation algorithms, RBAC, or CMS content models
- App must keep reading `DATABASE_URL`, `TRANSCRIBER_URL`, `KOKORO_BASE_URL`
- Preserve user-facing “transcriber” error/status wording

## Success criteria

- `docker compose` defines containers named exactly `db`, `app`, `whisper`, `kokoro`
- Networking env points at those names
- `automation/AGENTS.md` documents VPS deploy context for Cursor and Claude

## Risks and open questions

- Existing volumes/projects created under old service names (`postgres`,
  `transcriber`) may need `docker compose down` and recreate or volume remap on
  upgrade; data in `pgdata` volume typically survives if the volume name is
  unchanged.
