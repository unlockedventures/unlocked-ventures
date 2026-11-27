# Docker / VPS deployment

Canonical production: **`unlockedventures/unlocked-ventures`** (`main`).  
Live: **https://unlockedventures.com/**

**Tracked packaging:** Dockerfiles, `docker-compose*.yml`, `.github/`.  
**Coding:** root `README.md` (`pnpm`).

## Trigger deploy (no `automation/` required)

See root `AGENTS.md` § Production deploy: next `prod-YYYY.MM.N` + short `-m` from
recent commits + push **tag only** → **Deploy IONOS**.

## Data reuse

`UV_DATA_DIR=/var/lib/unlocked-venture` · `UV_MEDIA_DIR=…/media` — reused every deploy.

## Private repository

Safe with VPS read-only Deploy key + SSH origin (Actions `remote-git-checkout.sh`
re-asserts it). Anonymous HTTPS on the VPS breaks after the repo is Private.

## Optional local notes

Gitignored `automation/` on this clone holds deeper AI/ops context when present.
