#!/usr/bin/env bash
# SCP a local DB+media archive to the VPS and import it into on-disk UV paths.
# Never puts media or archives into Git — run from a machine that has automation/backups/.
#
# Usage:
#   export IONOS_HOST=… IONOS_SSH_USER=… IONOS_APP_PATH=…
#   bash .github/scripts/scp-import-backup.sh [archive.tar.gz]
#
# Default archive: automation/backups/unlocked-ventures-20261105-120601.tar.gz
# VPS defaults: UV_DATA_DIR=/var/lib/unlocked-venture UV_MEDIA_DIR=…/media
#
# Import requires empty Postgres tables and empty media dir (script can wipe with --wipe).
set -euo pipefail

: "${IONOS_HOST:?set IONOS_HOST}"
: "${IONOS_SSH_USER:?set IONOS_SSH_USER}"
: "${IONOS_APP_PATH:?set IONOS_APP_PATH}"

repo_root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
wipe=0
archive=""

for arg in "$@"; do
  case "$arg" in
    --wipe) wipe=1 ;;
    -h|--help)
      sed -n '2,16p' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *)
      archive="$arg"
      ;;
  esac
done

if [[ -z "$archive" ]]; then
  archive="$repo_root/automation/backups/unlocked-ventures-20261105-120601.tar.gz"
fi
if [[ "$archive" != /* ]]; then
  archive="$PWD/$archive"
fi
if [[ ! -f "$archive" ]]; then
  echo "Archive not found: $archive" >&2
  echo "Keep DB+media archives under gitignored automation/backups/ — never commit media." >&2
  exit 1
fi

# shellcheck source=ionos-ssh.sh
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ionos-ssh.sh"

remote="${IONOS_SSH_USER}@${IONOS_HOST}"
remote_archive="/tmp/unlocked-ventures-import-$(date -u +%Y%m%d-%H%M%S).tar.gz"
data_dir="${UV_DATA_DIR:-/var/lib/unlocked-venture}"
media_dir="${UV_MEDIA_DIR:-/var/lib/unlocked-venture/media}"

echo "scp $(basename "$archive") → ${remote}:${remote_archive}"
ionos_scp "$archive" "${remote}:${remote_archive}"

ionos_ssh "$remote" \
  "export APP_PATH=$(printf '%q' "$IONOS_APP_PATH"); \
   export REMOTE_ARCHIVE=$(printf '%q' "$remote_archive"); \
   export UV_DATA_DIR=$(printf '%q' "$data_dir"); \
   export UV_MEDIA_DIR=$(printf '%q' "$media_dir"); \
   export WIPE=$(printf '%q' "$wipe"); \
   bash -s" <<'REMOTE'
set -euo pipefail
cd "$APP_PATH"

command -v docker >/dev/null
docker compose version >/dev/null

if [[ ! -f .env ]]; then
  echo "::error::No .env on VPS at ${APP_PATH}. Deploy once (or write-remote-env) before import." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a
export UV_DATA_DIR="${UV_DATA_DIR:-/var/lib/unlocked-venture}"
export UV_MEDIA_DIR="${UV_MEDIA_DIR:-/var/lib/unlocked-venture/media}"

bash .github/scripts/prepare-data-dirs.sh

echo "stopping app (import refuses while app runs)..."
docker compose stop app >/dev/null 2>&1 || true
docker rm -f app-candidate >/dev/null 2>&1 || true

if [[ "$WIPE" == "1" ]]; then
  echo "WARNING: --wipe destroying Postgres data dir and media on disk..."
  docker compose down
  rm -rf "${UV_DATA_DIR}/postgres" "${UV_MEDIA_DIR}"
  bash .github/scripts/prepare-data-dirs.sh
fi

docker compose up -d db
# wait healthy
for i in $(seq 1 60); do
  if docker compose exec -T db sh -ec 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "importing archive into UV_DATA_DIR=${UV_DATA_DIR} UV_MEDIA_DIR=${UV_MEDIA_DIR}"
UV_DATA_DIR="$UV_DATA_DIR" UV_MEDIA_DIR="$UV_MEDIA_DIR" \
  bash scripts/import-db.sh "$REMOTE_ARCHIVE"

rm -f -- "$REMOTE_ARCHIVE"
echo "starting full stack..."
docker compose up -d
docker compose ps
echo "import done — media is on disk at ${UV_MEDIA_DIR} (not in Git)"
REMOTE
