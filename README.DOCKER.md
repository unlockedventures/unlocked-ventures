# Docker / VPS deployment

**All deploy docs and AI context live in gitignored `automation/`** (not committed).

Canonical production repo: **`unlockedventures/unlocked-ventures`** (`main`).  
Live site: **https://unlockedventures.com/** — see `automation/2026-11-27-ai-context.md`.

| Path | Purpose |
| ---- | ------- |
| `automation/2026-11-27-ai-context.md` | **Current** — what we did + live state |
| `automation/NEXT-DEPLOY.md` | First tag deploy checklist / remaining polish |
| `automation/WHEN-VPS-READY.md` | Ordered bring-up playbook |
| `automation/README.md` | Index of this folder |
| `automation/README.DOCKER.md` | Detailed operator runbook (as-built) |
| `automation/AGENTS.md` | Deploy AI rules (zero-downtime order) |
| `automation/RETIRED-REPO.md` | BrainStation-23 copy retired |
| `automation/unlocked-venture-deployment.pdf` | Full LaTeX technical guide |
| `automation/backups/*.tar.gz` | DB+media archive (local only — never GitHub) |

**Tracked packaging:** Dockerfiles, `docker-compose*.yml`, `.github/workflows/`, `.github/scripts/`.  
**Coding:** root `README.md` (`pnpm`). Media is never pushed to GitHub — scp + import only.  

Production tags: annotated `prod-yyyy.MM.n` from **`main`** (not branch push alone).  
Cutover: candidate `:3001` → nginx flip → recreate `:3000` → nginx flip back (zero downtime).  
SSH for Actions: **`IONOS_SSH_PRIVATE_KEY`** only (guideline docs never document login passwords).
