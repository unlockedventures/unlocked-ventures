# Decision and Change Log: VPS Docker container names and automation context

Project: Unlocked Ventures

| Date       | Actor, if known | Type         | Summary and scope | Evidence or link |
| ---------- | --------------- | ------------ | ----------------- | ---------------- |
| 2026-11-25 | user            | decision     | Require exact container names `db`, `app`, `whisper`, `kokoro`; add `automation/` for Cursor/Claude deploy context; no business-logic changes | user query |
| 2026-11-25 | assistant       | change       | Renamed Compose services and set `container_name`; wired env/scripts/docs; created automation AI context and this unit | repo edits |
| 2026-11-25 | assistant       | verification | See below | commands in this file |
| 2026-11-25 | user            | decision     | Secrets via GitHub Actions / Jenkins; ensure clean gitignore, dockerignore, README.DOCKER.md | user query |
| 2026-11-25 | assistant       | change       | Tightened ignore files; root + transcriber dockerignore; README.DOCKER.md; compose env_file required:false; docs/automation updates | repo edits |
| 2026-11-25 | user            | decision     | Alpine/distroless where safe; non-root UIDs; multi-stage; Gitleaks; IONOS Actions deploy; minimal attack surface; no business-logic break | user query |
| 2026-11-25 | assistant       | change       | Production Dockerfiles + compose hardening; docker-compose.dev.yml; Gitleaks + deploy-ionos workflows; next standalone output | repo edits |
| 2026-11-25 | user            | decision     | 8GB/4vCPU host also runs nginx/Docker/firewall/git; whisper/kokoro must accept 10h+ jobs (no 30m fail) | user query |
| 2026-11-25 | assistant       | change       | Compose GB limits; 12h transcription timeout + lease; nginx long-job example; whisper workdir volume | repo edits |
| 2026-11-25 | user            | decision     | All deploy-related AI context stays under gitignored `automation/` | user query |
| 2026-11-25 | assistant       | change       | `/automation/` added to `.gitignore`; removed root Cursor deploy rule; nginx snippet inlined in README.DOCKER.md | repo edits |
| 2026-11-25 | user            | decision     | Local compose uses `.env`; Actions secrets → remote `.env`; prune old containers/images after deploy; keep postgres+media on disk | user query |
| 2026-11-25 | assistant       | change       | Host bind mounts `${UV_DATA_DIR}`; prepare-data-dirs; write-remote-env UV_DATA_DIR; remote-compose-up prune; rsync exclude `data/` | repo edits |
| 2026-11-25 | user            | decision     | Deploy only via tag `prod-yyyy.MM.n` from `deploy`; rollback previous containers on failure; show failure reason in Actions | user query |
| 2026-11-25 | assistant       | change       | Tag trigger + validate/ensure-on-deploy; remote-snapshot; compose-up rollback + `::error::`; README.DOCKER | repo edits |
| 2026-11-25 | user            | decision     | SSH git pull on VPS; backup previous containers; rollback on fail; near-zero downtime if possible | user query |
| 2026-11-25 | assistant       | change       | remote-git-checkout; candidate :3001; cutover; optional nginx switch; drop rsync; named images uv-*:local | repo edits |
| 2026-11-25 | user            | decision     | Tracked AI context (outside automation/): “deploy” phrases → annotated prod tag + push | user query |
| 2026-11-25 | assistant       | change       | AGENTS.md Production deploy section; prod-deploy.mdc; CLAUDE/GEMINI/copilot/cursor/aidlc/README pointers | repo edits |
| 2026-11-25 | user            | decision     | List all Actions repo secrets at top of deploy workflow; Ubuntu IONOS VPS | user query |
| 2026-11-25 | assistant       | change       | Expanded deploy-ionos.yml header checklist; require IONOS_SSH_PRIVATE_KEY; README.DOCKER pointer | repo edits |
| 2026-11-25 | user            | decision     | Distroless/Alpine, non-root fixed UIDs, no shell login, minimize attack surface all containers | user query |
| 2026-11-25 | assistant       | change       | App → distroless node + mjs entrypoint; whisper/kokoro shell strip + nologin; Compose read_only/caps/pids; bind 127.0.0.1:3000 | repo edits |
| 2026-11-25 | user            | decision     | Move firoz/ into automation/; delete firoz; document backup restore for local+VPS; double-check readiness | user query |
| 2026-11-25 | assistant       | change       | firoz→automation (AI context + tar.gz); import/export use UV_DATA_DIR/media; README.DOCKER local+restore+VPS steps | repo edits |
| 2026-11-25 | user            | decision     | Ensure existing application and business logic are not broken | user query |
| 2026-11-25 | assistant       | verification | App/CMS/RBAC untouched except env-overridable timeouts + PodcastAudio staticDir→cwd; media bind back to ./media | audit below |
| 2026-11-25 | user            | decision     | Write permission only for media and required tmp paths | user query |
| 2026-11-25 | assistant       | change       | tmpfs mode 0700 + service UIDs; prepare-data-dirs chown/ACL not world-writable; docs write-surface table | repo edits |
| 2026-11-25 | user            | decision     | Containers healthy but http://127.0.0.1:3000/ showed nothing — find and fix | user query |
| 2026-11-25 | assistant       | change       | Root cause: empty Postgres (prod never schema-pushes) + image missing ensure-*.sql; copy all ensure SQL; harden ensure-schema.mjs; import automation backup; README.DOCKER restore-first | repo edits |
| 2026-11-25 | assistant       | verification | ensure-schema applied; homepage 200 with Unlocked Ventures markup; hero media 200; all four healthy | commands below |
| 2026-11-25 | user            | decision     | All containers must remain on Docker network named `unlocked-venture` | user query |
| 2026-11-25 | assistant       | change       | Named default network in prod/dev compose; candidate joins external `unlocked-venture`; deploy script checks that network | repo edits |
| 2026-11-25 | user            | decision     | Keep all deployment-related things in Dockerfiles, compose, and GitHub Actions so developers need not worry while coding | user query |
| 2026-11-25 | assistant       | change       | Deploy packaging boundary in AGENTS/README; slim developer README to pnpm-first; move nginx switch under `.github/scripts`; Docker/workflow comments | repo edits |
| 2026-11-25 | user            | decision     | Ensure VPS deploy via GitHub Actions has no issues | user query |
| 2026-11-25 | assistant       | change       | Network dual-home before worker refresh; CMS schema gate; stronger HTTP health; DATABASE_URL host check; ENSURE_SCHEMA_STRICT on VPS; validate-compose in Actions | repo edits |
| 2026-11-25 | user            | decision     | Deploy order: network→disk mounts→backup→deploy; success prune previous; fail restore; 0-downtime Actions; all deploy docs+AI context in automation/ | user query |
| 2026-11-25 | assistant       | change       | remote-compose-up phased flow + success cleanup; automation canonical docs; root README.DOCKER stub; workflow step renames | repo edits |

## Verification details, if needed

Commands run:

- `docker compose config --services` → `kokoro`, `whisper`, `db`, `app`
- `docker compose config` showed `container_name` for each of `db`, `whisper`,
  `kokoro`, `app`, plus `TRANSCRIBER_URL=http://whisper:8080` and
  `KOKORO_BASE_URL=http://kokoro:8880` on `app`
- Grep of compose/env example/scripts/README/automation for
  `exec -T postgres`, `@postgres:5432`, `http://transcriber` → no matches

Not run: live VPS `docker compose up -d`, container health, or end-to-end podcast
generation against the renamed stack.

Follow-up verification (ignore / Docker docs):

- `docker compose config` after `env_file.required: false`
- `git check-ignore -v .env .env.example docker-compose.override.yml` (expect
  `.env` and override ignored; `.env.example` not ignored)

Hardening verification:

- `docker compose config` (prod) and `docker compose -f docker-compose.dev.yml config` OK
- Services: `db`, `whisper`, `kokoro`, `app`
- `cd transcriber && python3 -m unittest test_transcribe.py` — 13 passed
- Not run: full image build, live 10h transcription, live IONOS deploy

Persist / local `.env` / prune verification:

- `bash -n .github/scripts/*.sh`
- `bash .github/scripts/prepare-data-dirs.sh` → `./data/{postgres,media,whisper-*}`
- `docker compose config --quiet` with local `.env` → OK
- `git check-ignore -v data/postgres .env` → ignored
- Not run: full `docker compose up -d --build`, live IONOS deploy, or image prune on VPS

Tag / rollback verification:

- `bash -n .github/scripts/*.sh`
- `validate-prod-tag.sh prod-2026.11.1` → ok; rejects `prod-2026.11.0`, `prod-2026.13.1`, `deploy`
- Not run: live tag push, live rollback on VPS

Blank homepage / empty DB verification:

- `docker logs app` previously: `relation "site" does not exist`; ensure-schema ENOENT for `ensure-rbac.sql`
- `bash scripts/import-db.sh automation/backups/unlocked-ventures-20261105-120601.tar.gz` after emptying media
- `docker compose build app --no-cache` then `up -d` → ensure-schema applied; homepage HTML includes brand/hero; `/api/media/file/hero-photo-primary-1.png` → 200

Git-pull / candidate verification:

- `docker compose config --quiet` OK
- `UV_CANDIDATE_NETWORK=… docker compose -f docker-compose.candidate.yml config --quiet` OK
- Not run: live SSH git checkout, candidate boot, or nginx upstream flip on VPS
| 2026-11-27 | assistant | change | Harden remote-compose-up: always restore+verify previous stack on failure; aggressive unused Docker/temp prune on success (keep data dirs) | user request |
| 2026-11-27 | assistant | change | Wire nginx uv-backend snippet + require :3001/:3000 flips for zero-downtime cutover; VPS site wired live | user request |
