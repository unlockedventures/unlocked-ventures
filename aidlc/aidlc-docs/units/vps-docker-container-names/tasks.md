# Tasks: VPS Docker container names and automation context

Project: Unlocked Ventures

| ID  | Task | Status | Owner, if known | Evidence or notes |
| --- | ---- | ------ | --------------- | ----------------- |
| T1  | Set Compose services/`container_name` to `db`, `whisper`, `kokoro`, `app` | done | assistant | `docker-compose.yml` |
| T2  | Update env example, README, export/import scripts, fixture URLs | done | assistant | host `db`, URL `whisper` |
| T3  | Create `automation/` Cursor + Claude deploy context | done | assistant | AGENTS/CLAUDE/README/rule |
| T4  | Point root/`aidlc` AGENTS at automation and new names | done | assistant | project map + command table |
| T5  | Validate Compose config; record verification | done | assistant | see audit |
| T6  | Clean `.gitignore` / `.dockerignore`; add `README.DOCKER.md` for CI secrets | done | assistant | Actions/Jenkins patterns; no committed `.env` |
| T7  | Multi-stage hardened images + non-root UIDs; prod compose; Gitleaks; IONOS workflow | done | assistant | app Alpine 10001; whisper slim 10001; kokoro pin 1000; db alpine |
| T8  | 8GB host-aware limits; 12h job timeouts/lease; nginx long-job example | done | assistant | no more 30m/1h kills for whisper |
| T9  | Local `.env` + host bind mounts for postgres/media; Actions write `.env`; prune old images after deploy | done | assistant | `UV_DATA_DIR`; prepare-data-dirs; remote-compose-up prune |
| T10 | Tag-only trigger `prod-yyyy.MM.n`; snapshot + rollback on failure; Actions `::error::` | done | assistant | validate/ensure-tag; remote-snapshot; rollback in compose-up |
| T11 | SSH git checkout; backup images; candidate :3001 then cutover; fail leaves live stack up | done | assistant | remote-git-checkout; candidate compose; nginx optional switch |
| T12 | Document deploy-via-tag for AI agents in tracked entry points (not only automation/) | done | assistant | AGENTS.md + CLAUDE/GEMINI/copilot/cursor/aidlc/README |
| T13 | Distroless/Alpine, non-root fixed UIDs, no login shells; Compose DevSecOps baseline | done | assistant | app distroless 10001; whisper/kokoro hardened; db alpine |
| T14 | Move firoz→automation; fix import/export for UV_DATA_DIR; document restore + readiness | done | assistant | automation/backups + README.DOCKER |
| T15 | Harden Actions VPS deploy (network dual-home, schema gate, health, compose validate) | done | assistant | remote-compose-up; write-remote-env; validate-compose |

## Completion checks

- [x] Requested behavior implemented with existing framework and brand patterns.
- [x] Persisted editor content, slugs, routes and relationships preserved.
- [x] Server-side authorization enforced for affected operations. (unchanged)
- [x] Additive migration/compatibility SQL and rollout notes provided if schema changes require them. (N/A)
- [x] Required Payload types/admin import map generated using documented commands. (N/A)
- [x] Appropriate static checks, meaningful tests or manual checks completed as permitted by the task.
- [x] Relevant documentation updated and remaining limitations recorded.

## Handoff notes, when needed

### 2026-11-25 — assistant

- Completed: Exact container names; automation AI context; docs/scripts/env updates
- Next: Operator runs `docker compose up -d` on the VPS and confirms `docker ps` names
- Constraints: Local `.env` host updated for Compose; do not commit secrets. Live VPS up not run from this session unless operator does so.
- Files touched: compose, env example, scripts, README, AGENTS, automation/*, aidlc unit, test fixture URLs
- Checks run: recorded in audit.md

### 2026-11-25 — assistant (persist + env + prune)

- Completed: Bind mounts under `UV_DATA_DIR` (local `./data`, VPS `/var/lib/unlocked-venture`); Actions `write-remote-env.sh`; post-up container/image prune without touching data; rsync excludes `data/`
- Next: Operator `cp .env.example .env` → `prepare-data-dirs` → `docker compose up -d --build`; live IONOS deploy when ready
- Checks: `docker compose config --quiet`; prepare-data-dirs; gitignore for `.env` and `/data/`

### 2026-11-25 — assistant (tag deploy + rollback)

- Completed: Trigger on `prod-*` tags only (not branch push); validate `prod-yyyy.MM.n` + commit on `deploy`; pre-rsync snapshot; rollback previous tree/images on failure; `::error::` in Actions
- Next: Operator tags from `deploy` and pushes; confirm rollback path on a deliberate bad deploy if desired
- Checks: `bash -n` scripts; validate-prod-tag accept/reject cases

### 2026-11-25 — assistant (git pull + near-zero downtime)

- Completed: Replace rsync with SSH git checkout; snapshot images/SHA/env; build while live; app-candidate :3001 health gate; cutover :3000; rollback without touching live if pre-cutover fail
- VPS need: git clone at IONOS_APP_PATH with fetch access
- Checks: compose + candidate config; bash -n

### 2026-11-25 — assistant (AI deploy phrases)

- Completed: Canonical § Production deploy in AGENTS.md; mirrored in CLAUDE, GEMINI, copilot-instructions, cursor rules (incl. prod-deploy.mdc), aidlc/AGENTS, README + README.DOCKER
- Next: Operator says “deploy” → agent tags `prod-yyyy.MM.n` with `-m` and pushes tag

### 2026-11-27 — assistant (fail restore / success prune)
- Completed: `remote-compose-up.sh` always restores prior images+compose up+health on failure; success runs container/image/network/volume/builder prune + temp cleanup; keeps UV_DATA_DIR/UV_MEDIA_DIR and refreshed `.deploy-rollback`
- Checks: `bash -n` on script + extracted remote body
- Next: next annotated `prod-*` tag from `main` picks this up

### 2026-11-27 — assistant (zero-downtime nginx flip)
- Completed: `ensure-nginx-zero-downtime.sh`; harden `nginx-uv-upstream-switch.sh`; cutover flips edge to candidate before recreating app; VPS site includes snippet; edge still 200
- Checks: bash -n; live nginx wire + https 200

