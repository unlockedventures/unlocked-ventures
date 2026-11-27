#!/usr/bin/env bash
# Static Compose validation for CI (no VPS, no secrets). Fails on invalid YAML/interpolation.
set -euo pipefail

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

command -v docker >/dev/null
docker compose version >/dev/null

# Main/candidate compose require a .env (env_file required: true). Use example placeholders.
if [[ ! -f .env ]]; then
  cp .env.example .env
  # Ensure required keys exist for config interpolation (placeholders only).
  grep -q '^NEXT_PUBLIC_SERVER_URL=' .env \
    || echo 'NEXT_PUBLIC_SERVER_URL=http://127.0.0.1:3000' >>.env
fi

docker compose -f docker-compose.yml config --quiet
docker compose -f docker-compose.dev.yml config --quiet

# Candidate file marks unlocked-venture as external — create if missing so config resolves.
docker network create unlocked-venture >/dev/null 2>&1 || true
docker compose -f docker-compose.candidate.yml config --quiet

echo 'compose files ok (prod, dev, candidate)'
