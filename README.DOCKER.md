# Docker / VPS deployment

| | |
| :--- | ---: |
| **Repo** | `unlockedventures/unlocked-ventures` · `main` |
| **Live** | https://unlockedventures.com |

**Tracked packaging:** Dockerfiles · compose · `.github/`  
**Coding:** root `README.md` (`pnpm`)

## Zero downtime

When present locally, open `automation/DEPLOYMENT-GUIDE.md` — clean diagrams and business language for **nginx upstream flips** (`:3000` ↔ `:3001`).

Agents without that folder: root **`AGENTS.md`** § Production deploy → annotated `prod-yyyy.MM.n` + short message → **Deploy IONOS**. VPS database and media are reused, not wiped.

## Private repository

Supported via VPS read-only Deploy key over SSH. No credentials belong in tracked docs.

## Optional local library

`automation/` may exist on an operator machine. It is **gitignored** and must never be committed.
