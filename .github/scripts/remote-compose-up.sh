#!/usr/bin/env bash
# Near-zero-downtime VPS deploy (GitHub Actions → SSH).
#
# Ordered phases (must stay in this order):
#   1) Ensure Docker network unlocked-venture
#   2) Ensure on-disk mounts (Postgres + media + whisper caches)
#   3) Confirm predeploy backup of running app (from remote-snapshot.sh)
#   4) Build while live stack serves; candidate :3001 → cut over :3000
#   5) Success → remove candidate/previous unused images; keep disk data
#      Failure → restore previous app from .deploy-rollback (zero downtime if
#      cutover never started)
#
# Operator/AI docs: gitignored automation/README.DOCKER.md + automation/AGENTS.md
set -euo pipefail

: "${IONOS_HOST:?}"
: "${IONOS_SSH_USER:?}"
: "${IONOS_APP_PATH:?}"

# shellcheck source=ionos-ssh.sh
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ionos-ssh.sh"

remote="${IONOS_SSH_USER}@${IONOS_HOST}"
release_tag="${DEPLOY_TAG:-${GITHUB_REF_NAME:-unknown}}"

ionos_ssh "$remote" \
  "export APP_PATH=$(printf '%q' "$IONOS_APP_PATH"); export RELEASE_TAG=$(printf '%q' "$release_tag"); bash -s" <<'REMOTE'
set -euo pipefail
cd "$APP_PATH"

command -v docker >/dev/null
docker compose version >/dev/null
command -v curl >/dev/null

rollback=".deploy-rollback"
cutover_started=0
candidate_started=0
STACK_NETWORK=unlocked-venture

cleanup_candidate() {
  docker rm -f app-candidate >/dev/null 2>&1 || true
  docker compose -p uv-candidate -f docker-compose.candidate.yml down --remove-orphans >/dev/null 2>&1 || true
}

# --- Phase 1: network -------------------------------------------------------
ensure_stack_network() {
  echo "phase 1: ensure Docker network ${STACK_NETWORK}"
  docker network create "$STACK_NETWORK" >/dev/null 2>&1 || true
  local c
  for c in app db whisper kokoro; do
    if docker inspect "$c" >/dev/null 2>&1; then
      docker network connect "$STACK_NETWORK" "$c" >/dev/null 2>&1 || true
    fi
  done
  if ! docker network inspect "$STACK_NETWORK" >/dev/null 2>&1; then
    echo "::error::Failed to create or inspect Docker network ${STACK_NETWORK}" >&2
    return 1
  fi
  echo "stack network ready: ${STACK_NETWORK}"
}

# --- Phase 2: on-disk mounts -------------------------------------------------
prepare_disk_mounts() {
  echo "phase 2: prepare on-disk Postgres + media mounts"
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
  export UV_DATA_DIR="${UV_DATA_DIR:-./data}"
  export UV_MEDIA_DIR="${UV_MEDIA_DIR:-./media}"
  bash .github/scripts/prepare-data-dirs.sh
  echo "disk mounts: UV_DATA_DIR=${UV_DATA_DIR} UV_MEDIA_DIR=${UV_MEDIA_DIR}"
}

# --- Phase 3: backup of existing running app --------------------------------
ensure_predeploy_backup() {
  echo "phase 3: confirm backup of existing running app"
  mkdir -p "${rollback}/images"
  local name img_id img_ref had=0
  for name in app db kokoro whisper; do
    if ! docker inspect "$name" >/dev/null 2>&1; then
      continue
    fi
    had=1
    img_id="$(docker inspect -f '{{.Image}}' "$name")"
    img_ref="$(docker inspect -f '{{.Config.Image}}' "$name")"
    docker tag "$img_id" "uv-rollback-${name}:predeploy"
    printf '%s\n' "$img_id" >"${rollback}/images/${name}.id"
    printf '%s\n' "$img_ref" >"${rollback}/images/${name}.ref"
    echo "backup: uv-rollback-${name}:predeploy <- ${img_ref}"
  done
  if [[ -d .git ]]; then
    git rev-parse HEAD >"${rollback}/git-sha"
  fi
  if [[ -f .env ]]; then
    cp -a .env "${rollback}/env.bak"
    chmod 600 "${rollback}/env.bak" || true
  fi
  printf '%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >"${rollback}/created_at"
  if [[ "$had" -eq 0 ]]; then
    echo "backup: no running stack yet (first deploy)"
  else
    echo "backup ready under ${rollback}/"
  fi
}

# Production never schema-pushes; a dump (or prior volume) must already have CMS tables.
require_cms_schema() {
  local reg
  reg="$(
    docker compose exec -T db sh -ec \
      'psql --username="$POSTGRES_USER" --dbname="$POSTGRES_DB" --tuples-only --no-align --command "select to_regclass('\''public.site'\'')"' \
      2>/dev/null || true
  )"
  reg="$(printf '%s' "$reg" | tr -d '[:space:]')"
  if [[ "$reg" != "site" ]]; then
    echo "::error::Postgres has no CMS schema (public.site missing). Restore a dump into UV_DATA_DIR/UV_MEDIA_DIR (see automation/README.DOCKER.md), then redeploy." >&2
    return 1
  fi
  echo "cms schema ok (public.site present)"
}

wait_http_ok() {
  local url="$1"
  local tries="${2:-90}"
  local i body
  for ((i = 1; i <= tries; i++)); do
    body="$(curl -fsS --max-time 8 "$url" 2>/dev/null)" || {
      sleep 2
      continue
    }
    if printf '%s' "$body" | grep -Eq 'relation "[^"]+" does not exist|Failed query:'; then
      sleep 2
      continue
    fi
    if printf '%s' "$body" | grep -Fq 'Unlocked Ventures'; then
      echo "healthy: ${url}"
      return 0
    fi
    sleep 2
  done
  return 1
}

rollback_stack() {
  local reason="$1"
  echo "deploy failed — restoring previous app..." >&2
  echo "failure reason: ${reason}" >&2

  cleanup_candidate

  # Live app never replaced — leave it; reset git/env for consistency.
  if [[ "$cutover_started" -eq 0 ]]; then
    if [[ -f "${rollback}/git-sha" ]] && [[ -d .git ]]; then
      git checkout -f "$(cat "${rollback}/git-sha")" >/dev/null 2>&1 || true
    fi
    if [[ -f "${rollback}/env.bak" ]]; then
      cp -a "${rollback}/env.bak" .env
      chmod 600 .env || true
    fi
    echo "::error::Deploy failed (${RELEASE_TAG}): ${reason}. Previous containers left running (no cutover — zero downtime)." >&2
    docker compose ps >&2 || true
    return 1
  fi

  if [[ ! -f "${rollback}/images/app.ref" ]]; then
    echo "::error::Deploy failed (${RELEASE_TAG}): ${reason}. No image backup to restore." >&2
    return 1
  fi

  if [[ -f "${rollback}/git-sha" ]] && [[ -d .git ]]; then
    git checkout -f "$(cat "${rollback}/git-sha")"
  fi
  if [[ -f "${rollback}/env.bak" ]]; then
    cp -a "${rollback}/env.bak" .env
    chmod 600 .env || true
  fi

  local name img_ref
  for name in app db kokoro whisper; do
    if [[ ! -f "${rollback}/images/${name}.ref" ]]; then
      continue
    fi
    img_ref="$(cat "${rollback}/images/${name}.ref")"
    if docker image inspect "uv-rollback-${name}:predeploy" >/dev/null 2>&1; then
      docker tag "uv-rollback-${name}:predeploy" "$img_ref"
      echo "rollback: restored ${img_ref}"
    fi
  done

  ensure_stack_network || true

  if ! docker compose up -d --no-build --remove-orphans; then
    echo "::error::Deploy failed (${RELEASE_TAG}): ${reason}. Rollback compose up also failed." >&2
    docker compose ps >&2 || true
    return 1
  fi

  for name in app db kokoro whisper; do
    if [[ "$(docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null || echo false)" != true ]]; then
      echo "::error::Deploy failed (${RELEASE_TAG}): ${reason}. Rollback left ${name} down." >&2
      docker logs --tail 80 "$name" >&2 || true
      return 1
    fi
  done

  echo "::error::Deploy failed (${RELEASE_TAG}): ${reason}. Previous app restored." >&2
  docker compose ps >&2 || true
  return 1
}

# --- Phase 5 success: drop previous unused app/images; keep disk data --------
cleanup_after_success() {
  echo "phase 5: success — remove previous unused containers/images (keep disk data)"
  cleanup_candidate

  # Image IDs from the generation we backed up at phase 3 (previous app).
  local -a old_ids=()
  local name id
  for name in app db kokoro whisper; do
    if [[ -f "${rollback}/images/${name}.id" ]]; then
      old_ids+=("$(cat "${rollback}/images/${name}.id")")
    fi
  done

  # Refresh predeploy tags to the NEW running generation (backup for next deploy).
  for name in app db kokoro whisper; do
    id="$(docker inspect -f '{{.Image}}' "$name")"
    docker tag "$id" "uv-rollback-${name}:predeploy"
    printf '%s\n' "$id" >"${rollback}/images/${name}.id"
    printf '%s\n' "$(docker inspect -f '{{.Config.Image}}' "$name")" >"${rollback}/images/${name}.ref"
  done
  if [[ -d .git ]]; then
    git rev-parse HEAD >"${rollback}/git-sha"
  fi
  if [[ -f .env ]]; then
    cp -a .env "${rollback}/env.bak"
    chmod 600 "${rollback}/env.bak" || true
  fi

  # Drop stopped leftovers + dangling layers.
  docker container prune -f >/dev/null || true
  docker image prune -f >/dev/null || true

  # Best-effort remove previous generation image IDs if nothing uses them anymore.
  for id in "${old_ids[@]+"${old_ids[@]}"}"; do
    [[ -n "$id" ]] || continue
    docker rmi "$id" >/dev/null 2>&1 || true
  done

  # Legacy Compose default network name from older releases.
  docker network rm unlocked-venture_default >/dev/null 2>&1 || true
  docker builder prune -f >/dev/null || true

  echo "cleanup done (previous unused images removed; UV_DATA_DIR / UV_MEDIA_DIR kept on disk)"
}

# =============================================================================
# Main
# =============================================================================
ensure_stack_network
prepare_disk_mounts

first_deploy=0
if ! docker inspect app >/dev/null 2>&1; then
  first_deploy=1
fi

ensure_predeploy_backup

echo "phase 4: build + near-zero-downtime cutover (release ${RELEASE_TAG})"
set +e
docker compose build --pull
build_rc=$?
set -e
if [[ "$build_rc" -ne 0 ]]; then
  rollback_stack "docker compose build failed (exit ${build_rc})"
  exit 1
fi

if [[ "$first_deploy" -eq 1 ]]; then
  echo "first deploy: no previous app — compose up"
  set +e
  docker compose up -d --remove-orphans
  up_rc=$?
  set -e
  if [[ "$up_rc" -ne 0 ]]; then
    rollback_stack "first deploy compose up failed (exit ${up_rc})"
    exit 1
  fi

  set +e
  require_cms_schema
  schema_rc=$?
  set -e
  if [[ "$schema_rc" -ne 0 ]]; then
    rollback_stack "first deploy: CMS schema missing (import a database dump before serving)"
    exit 1
  fi

  set +e
  wait_http_ok "http://127.0.0.1:3000/" 90
  prod_rc=$?
  set -e
  if [[ "$prod_rc" -ne 0 ]]; then
    docker logs --tail 100 app >&2 || true
    rollback_stack "first deploy: production app health check failed on :3000"
    exit 1
  fi
else
  # Live app dual-homed in phase 1 so DB DNS stays up while workers recreate.
  set +e
  docker compose up -d --no-deps --remove-orphans db whisper kokoro
  workers_rc=$?
  set -e
  if [[ "$workers_rc" -ne 0 ]]; then
    rollback_stack "compose up for db/whisper/kokoro failed (exit ${workers_rc})"
    exit 1
  fi

  set +e
  require_cms_schema
  schema_rc=$?
  set -e
  if [[ "$schema_rc" -ne 0 ]]; then
    rollback_stack "CMS schema missing on live database (abort before cutover)"
    exit 1
  fi

  cleanup_candidate
  candidate_started=1
  echo "starting app-candidate on 127.0.0.1:3001 (production :3000 still live)..."
  set +e
  docker compose -p uv-candidate -f docker-compose.candidate.yml up -d --no-build
  cand_rc=$?
  set -e
  if [[ "$cand_rc" -ne 0 ]]; then
    rollback_stack "app-candidate failed to start (exit ${cand_rc})"
    exit 1
  fi

  set +e
  wait_http_ok "http://127.0.0.1:3001/" 90
  health_rc=$?
  set -e
  if [[ "$health_rc" -ne 0 ]]; then
    docker logs --tail 100 app-candidate >&2 || true
    rollback_stack "app-candidate health check failed on :3001 (production left on :3000)"
    exit 1
  fi

  if [[ -x ./.github/scripts/nginx-uv-upstream-switch.sh ]]; then
    ./.github/scripts/nginx-uv-upstream-switch.sh 3001 || true
  fi

  cutover_started=1
  echo "cutover: replacing production app on :3000 with new image..."
  set +e
  docker compose up -d --no-deps --no-build --force-recreate app
  app_rc=$?
  set -e
  if [[ "$app_rc" -ne 0 ]]; then
    rollback_stack "production app cutover failed (exit ${app_rc})"
    exit 1
  fi

  set +e
  wait_http_ok "http://127.0.0.1:3000/" 60
  prod_rc=$?
  set -e
  if [[ "$prod_rc" -ne 0 ]]; then
    docker logs --tail 100 app >&2 || true
    rollback_stack "production app health check failed on :3000 after cutover"
    exit 1
  fi

  if [[ -x ./.github/scripts/nginx-uv-upstream-switch.sh ]]; then
    ./.github/scripts/nginx-uv-upstream-switch.sh 3000 || true
  fi

  cleanup_candidate
  candidate_started=0
fi

for name in app db kokoro whisper; do
  if [[ "$(docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null || echo false)" != true ]]; then
    docker logs --tail 80 "$name" >&2 || true
    rollback_stack "container not running after deploy: ${name}"
    exit 1
  fi
done

set +e
require_cms_schema
final_schema_rc=$?
set -e
if [[ "$final_schema_rc" -ne 0 ]]; then
  rollback_stack "CMS schema missing after deploy"
  exit 1
fi

echo "ok: app db kokoro whisper are running (release ${RELEASE_TAG})"
docker compose ps

cleanup_after_success
REMOTE
