# Docker / VPS deployment

Canonical product repo: **`unlockedventures/unlocked-ventures`** (`main`).  
Live brand: **https://unlockedventures.com/**

**Tracked packaging:** Dockerfiles, `docker-compose*.yml`, `.github/`.  
**Coding:** root `README.md` (`pnpm`).

## How production deploys work (zero downtime)

When present locally, read gitignored  
`automation/DEPLOYMENT-GUIDE.md` — plain-language story of **nginx upstream flips**
(live `:3000` ↔ candidate `:3001`) written for business and architecture readers.

Short form for agents (always available): root **`AGENTS.md`** § Production deploy —
annotated `prod-yyyy.MM.n` tag from `main` + short message from recent commits →
**Deploy IONOS**. Database and media on the VPS are reused, not wiped.

## Private repository

Supported: VPS uses a read-only Deploy key over SSH. Making the GitHub repository
private does not require putting credentials into tracked docs.

## Optional local folder

`automation/` may exist on an operator machine for deeper narrative and checklists.
It is **gitignored** and must never be committed.
