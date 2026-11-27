#!/usr/bin/env bash
# Build a local .env from Actions secrets and scp it to the VPS (mode 600).
# Does not echo secret values.
set -euo pipefail

: "${IONOS_HOST:?}"
: "${IONOS_SSH_USER:?}"
: "${IONOS_APP_PATH:?}"
: "${DATABASE_URL:?}"
: "${PAYLOAD_SECRET:?}"
: "${TRANSCRIBER_SECRET:?}"
: "${GEMINI_API_KEY:?}"
: "${NEXT_PUBLIC_SERVER_URL:?}"

umask 077
env_file="$(mktemp)"
trap 'rm -f -- "$env_file"' EXIT

# Compose DNS: app must reach Postgres as hostname "db" on network unlocked-venture.
if [[ "$DATABASE_URL" != *@db:* && "$DATABASE_URL" != *@db/* ]]; then
  echo "::error::DATABASE_URL must use Compose hostname 'db' (e.g. postgresql://payload:payload@db:5432/unlocked_ventures)." >&2
  exit 1
fi

# UV_DATA_DIR / UV_MEDIA_DIR: durable Postgres + uploads on the VPS disk (outside image layers)
cat >"$env_file" <<EOF
DATABASE_URL=${DATABASE_URL}
PAYLOAD_SECRET=${PAYLOAD_SECRET}
TRANSCRIBER_SECRET=${TRANSCRIBER_SECRET}
GEMINI_API_KEY=${GEMINI_API_KEY}
NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
KOKORO_BASE_URL=http://kokoro:8880
WHISPER_MODEL=${WHISPER_MODEL:-small}
TRANSCRIBER_TIMEOUT_SECONDS=${TRANSCRIBER_TIMEOUT_SECONDS:-43200}
GENERATION_LOCK_HOURS=${GENERATION_LOCK_HOURS:-12}
KOKORO_TIMEOUT_MS=${KOKORO_TIMEOUT_MS:-1800000}
UV_DATA_DIR=${UV_DATA_DIR:-/var/lib/unlocked-venture}
UV_MEDIA_DIR=${UV_MEDIA_DIR:-/var/lib/unlocked-venture/media}
ENSURE_SCHEMA_STRICT=1
EOF

# shellcheck source=ionos-ssh.sh
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ionos-ssh.sh"

remote="${IONOS_SSH_USER}@${IONOS_HOST}"
ionos_scp \
  "$env_file" "${remote}:${IONOS_APP_PATH}/.env"
ionos_ssh \
  "$remote" "chmod 600 -- $(printf '%q' "${IONOS_APP_PATH}/.env")"

echo "wrote remote .env (mode 600) at ${IONOS_APP_PATH}/.env"
