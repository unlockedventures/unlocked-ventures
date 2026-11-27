# Docker / VPS deployment

Canonical production repo: **`unlockedventures/unlocked-ventures`** (`main`).  
Live site: **https://unlockedventures.com/**

**Tracked packaging:** Dockerfiles, `docker-compose*.yml`, `.github/workflows/`, `.github/scripts/`.  
**Coding:** root `README.md` (`pnpm`). Day-to-day work does not need this file.

## Trigger a production deploy (AI agents — no `automation/` required)

User phrases **deploy** / **prod deploy** / **deploy it** / **trigger deploy** authorize
the flow in root `AGENTS.md` § Production deploy. Short form:

```bash
git checkout main
git pull --ff-only origin main
git fetch origin --tags
# next tag: prod-YYYY.MM.N  (N = max existing this month + 1, or 1)
# message: one short line from recent commits, e.g.
#   git log -5 --oneline origin/main
git tag -a "prod-YYYY.MM.N" -m "Short summary of what this release ships."
git push origin "refs/tags/prod-YYYY.MM.N"
```

That tag push starts GitHub Actions **Deploy IONOS**. A bare push of `main` does not.

## Reuse database + media (every deploy)

VPS bind mounts (written into remote `.env` from Actions secrets; defaults below):

- `UV_DATA_DIR=/var/lib/unlocked-venture` → Postgres at `…/postgres`
- `UV_MEDIA_DIR=/var/lib/unlocked-venture/media`

Tag deploys rebuild/replace **containers/images** only. They must **reuse** those
directories. Do not re-import a backup archive or use `--wipe` unless replacing content
on purpose. Success cleanup prunes unused Docker objects — never the data dirs.

## Private repository + Deploy IONOS

Safe to make `unlockedventures/unlocked-ventures` **Private** when the VPS has the
read-only Deploy key and SSH `origin` (Actions `remote-git-checkout.sh` enforces this).
Anonymous HTTPS fetch on the VPS will fail after going private.

## Optional local operator notes

When present on a machine, gitignored `automation/` holds deeper runbooks and AI context
(`WHEN-VPS-READY.md`, `README.DOCKER.md`, dated AI context). It is **not** required to
trigger a deploy, and clones often omit it. Never commit `automation/`, `.env`, or media.
