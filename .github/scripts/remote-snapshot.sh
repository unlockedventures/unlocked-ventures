#!/usr/bin/env bash
# Phase: backup existing running app before checkout/cutover.
# Tags images as uv-rollback-*:predeploy + saves git SHA + .env under .deploy-rollback/.
# Does not stop containers (zero downtime during backup).
# remote-compose-up.sh refreshes the same backup again after .env is written.
set -euo pipefail

: "${IONOS_HOST:?}"
: "${IONOS_SSH_USER:?}"
: "${IONOS_APP_PATH:?}"

# shellcheck source=ionos-ssh.sh
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ionos-ssh.sh"

remote="${IONOS_SSH_USER}@${IONOS_HOST}"

ionos_ssh "$remote" "export APP_PATH=$(printf '%q' "$IONOS_APP_PATH"); bash -s" <<'REMOTE'
set -euo pipefail

if [[ ! -d "$APP_PATH" ]]; then
  echo "first deploy: no existing app path; creating ${APP_PATH}"
  mkdir -p "$APP_PATH"
  exit 0
fi

cd "$APP_PATH"
command -v docker >/dev/null

rollback=".deploy-rollback"
rm -rf "${rollback}/images"
mkdir -p "${rollback}/images"

had_running=0
for name in app db kokoro whisper; do
  if ! docker inspect "$name" >/dev/null 2>&1; then
    echo "snapshot: container ${name} not present (ok on first deploy)"
    continue
  fi
  had_running=1
  img_id="$(docker inspect -f '{{.Image}}' "$name")"
  img_ref="$(docker inspect -f '{{.Config.Image}}' "$name")"
  docker tag "$img_id" "uv-rollback-${name}:predeploy"
  printf '%s\n' "$img_id" >"${rollback}/images/${name}.id"
  printf '%s\n' "$img_ref" >"${rollback}/images/${name}.ref"
  echo "snapshot: uv-rollback-${name}:predeploy <- ${img_ref}"
done

if [[ "$had_running" -eq 0 ]]; then
  echo "snapshot: no running stack yet"
fi

if [[ -d .git ]]; then
  git rev-parse HEAD >"${rollback}/git-sha"
  echo "snapshot: git SHA $(cat "${rollback}/git-sha")"
fi

if [[ -f .env ]]; then
  cp -a .env "${rollback}/env.bak"
  echo "snapshot: .env backed up"
fi

printf '%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >"${rollback}/created_at"
echo "snapshot ready under ${APP_PATH}/${rollback}"
REMOTE
