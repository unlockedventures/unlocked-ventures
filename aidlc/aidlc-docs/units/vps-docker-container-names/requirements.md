# Requirements: VPS Docker container names and automation context

Project: Unlocked Ventures

## Functional requirements

- FR-1: Compose must set exact container names `db`, `app`, `whisper`, and `kokoro`.
- FR-2: App Compose env must reach DB/transcription/TTS via `db`, `whisper`, and `kokoro` DNS.
- FR-3: Export/import scripts must target Compose service `db`.
- FR-4: `automation/` must hold Cursor and Claude deploy AI context documenting those names.
- FR-5: Podcast/CMS business logic must continue to use env-configured URLs, not hardcoded hosts.
- FR-6: Local `docker compose up -d` must load a gitignored `.env` (from `.env.example`).
- FR-12: All Compose services (prod, dev, and app-candidate) must join the Docker
  network named exactly `unlocked-venture`.
- FR-13: Deploy/VPS/CI packaging must stay in Dockerfiles, `docker-compose*.yml`,
  and `.github/workflows` / `.github/scripts` so day-to-day coding (pnpm / `src/`)
  does not require learning deploy procedures.
- FR-7: GitHub Actions deploy must write the VPS `.env` from repository secrets at runtime.
- FR-8: After a successful deploy, unused containers and images must be pruned; Postgres and
  media data on disk under `UV_DATA_DIR` must never be pruned or rsynced away.
- FR-9: Deploy runs only on push of tag `prod-yyyy.MM.n` (from `main`) or workflow_dispatch —
  not on every push to `main`.
- FR-10: If deploy build/up/health fails, restore the previously running containers, verify they
  are up (and :3000 healthy when possible), then fail the Actions job with a visible error reason.
- FR-14: After a successful deploy, prune unused containers, unused images, unused networks,
  unused volumes, builder cache, and deploy temp files; never delete UV_DATA_DIR / UV_MEDIA_DIR.
- FR-11: Deploy SSHs to the VPS, `git fetch`/`checkout` the release tag, builds while the old
  stack stays up, health-checks `app-candidate` on :3001, then cuts over :3000 (near-zero downtime).
- FR-12: Tracked AI entry points (outside gitignored `automation/`) must instruct agents that
  user “deploy” / “prod deploy” / “trigger deploy” means annotated `prod-yyyy.MM.n` tag + push.
- FR-13: Production images/containers use Alpine or distroless where feasible, fixed non-root
  UIDs, no login shells, and Compose DevSecOps baselines (read_only, cap_drop, no-new-privileges).

## Content and compatibility

No Payload schema or editorial content changes. Postgres and media use host bind mounts
under `${UV_DATA_DIR:-./data}` (VPS default `/var/lib/unlocked-venture`).

## Authorization and data protection

No RBAC changes. Do not commit secrets from `.env`.

## Quality requirements

Compose file must remain valid (`docker compose config`). Operator docs must match names.

## Acceptance criteria

- AC-1: Given Compose up, when listing containers, then names are exactly `db`, `whisper`,
  `kokoro`, `app`.
- AC-2: Given `.env.example`, when configuring Compose app DB access, then host is `db`.
- AC-3: Given export/import scripts, when exec targets the database, then service is `db`.
- AC-4: Given assistants editing deploy files, when they read `automation/AGENTS.md`, then
  container-name and env constraints are documented.
- AC-5: Given a local `.env`, when `docker compose config` runs, then it succeeds with
  `env_file: .env` required.
- AC-6: Given a successful IONOS deploy script, when cleanup runs, then container/image
  prune runs and `UV_DATA_DIR` / volumes are not deleted.
- AC-7: Given tag `prod-2026.11.1` on `main`, when the tag is pushed, then Deploy IONOS runs.
- AC-8: Given a failed compose up after a prior healthy stack, when the job ends, then previous
  containers are running again and the log contains `::error::Deploy failed`.

## Open questions

| ID  | Question | Answer or evidence | Status |
| --- | -------- | ------------------ | ------ |
| —   | none     | —                  | —      |

## Assumptions

- VPS deploy uses this repository’s `docker-compose.yml` as the runtime stack.
- Source directory `transcriber/` remains the Whisper image build context.

## Verification constraints

Validate Compose config statically. Live `docker compose up` on a VPS is operator-owned;
report whether local compose validation ran.
