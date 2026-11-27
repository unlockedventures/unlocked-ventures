#!/usr/bin/env bash
# Near-zero-downtime VPS deploy (GitHub Actions → SSH).
#
# Ordered phases (must stay in this order):
#   1) Ensure Docker network unlocked-venture
#   2) Ensure on-disk mounts (Postgres + media + whisper caches)
#   3) Confirm predeploy backup of running app (from remote-snapshot.sh)
#   4) Build while live stack serves; candidate :3001 → cut over :3000
#   5) Success → prune unused containers/images/build cache + deploy temps;
#                keep UV_DATA_DIR / UV_MEDIA_DIR and a fresh .deploy-rollback
#      Failure → restore previous containers from .deploy-rollback, verify they
#                are up, then exit non-zero (Actions fails)
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
had_previous=0
rolling_back=0
STACK_NETWORK=unlocked-venture

cleanup_candidate() {
  docker rm -f app-candidate >/dev/null 2>&1 || true
  docker compose -p uv-candidate -f docker-compose.candidate.yml down --remove-orphans >/dev/null 2>&1 || true
}

point_nginx_at_production() {
  if [[ -x ./.github/scripts/nginx-uv-upstream-switch.sh ]]; then
    ./.github/scripts/nginx-uv-upstream-switch.sh 3000 >/dev/null 2>&1 || true
  fi
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

containers_running() {
  local name
  for name in app db kokoro whisper; do
    if [[ "$(docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null || echo false)" != true ]]; then
      return 1
    fi
  done
  return 0
}

restore_previous_tree() {
  if [[ -f "${rollback}/git-sha" ]] && [[ -d .git ]]; then
    git checkout -f "$(cat "${rollback}/git-sha")" >/dev/null 2>&1 || true
  fi
  if [[ -f "${rollback}/env.bak" ]]; then
    cp -a "${rollback}/env.bak" .env
    chmod 600 .env || true
  fi
}

restore_previous_images() {
  local name img_ref
  for name in app db kokoro whisper; do
    if [[ ! -f "${rollback}/images/${name}.ref" ]]; then
      continue
    fi
    img_ref="$(cat "${rollback}/images/${name}.ref")"
    if docker image inspect "uv-rollback-${name}:predeploy" >/dev/null 2>&1; then
      docker tag "uv-rollback-${name}:predeploy" "$img_ref"
      echo "rollback: restored image tag ${img_ref}"
    fi
  done
}

# Always bring the previous stack back up when we had one, then fail the job.
rollback_stack() {
  local reason="$1"
  if [[ "$rolling_back" -eq 1 ]]; then
    echo "::error::Deploy failed (${RELEASE_TAG}): ${reason}. Rollback already in progress." >&2
    return 1
  fi
  rolling_back=1

  echo "deploy failed — restoring previous app..." >&2
  echo "failure reason: ${reason}" >&2

  cleanup_candidate
  point_nginx_at_production

  # First deploy with nothing to restore: stop broken leftovers and exit.
  if [[ "$had_previous" -eq 0 ]] || [[ ! -f "${rollback}/images/app.ref" ]]; then
    restore_previous_tree
    echo "::error::Deploy failed (${RELEASE_TAG}): ${reason}. No prior stack to restore." >&2
    docker compose ps >&2 || true
    return 1
  fi

  restore_previous_tree
  restore_previous_images
  ensure_stack_network || true

  set +e
  docker compose up -d --no-build --remove-orphans
  local up_rc=$?
  set -e
  if [[ "$up_rc" -ne 0 ]]; then
    echo "::error::Deploy failed (${RELEASE_TAG}): ${reason}. Rollback compose up also failed (exit ${up_rc})." >&2
    docker compose ps >&2 || true
    return 1
  fi

  if ! containers_running; then
    local name
    for name in app db kokoro whisper; do
      if [[ "$(docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null || echo false)" != true ]]; then
        echo "::error::Deploy failed (${RELEASE_TAG}): ${reason}. Rollback left ${name} down." >&2
        docker logs --tail 80 "$name" >&2 || true
      fi
    done
    return 1
  fi

  set +e
  wait_http_ok "http://127.0.0.1:3000/" 45
  local health_rc=$?
  set -e
  if [[ "$health_rc" -ne 0 ]]; then
    echo "::error::Deploy failed (${RELEASE_TAG}): ${reason}. Previous containers are up but :3000 health check failed." >&2
    docker logs --tail 100 app >&2 || true
    docker compose ps >&2 || true
    return 1
  fi

  echo "::error::Deploy failed (${RELEASE_TAG}): ${reason}. Previous containers restored and running; exiting." >&2
  docker compose ps >&2 || true
  return 1
}

fail_deploy() {
  local reason="$1"
  rollback_stack "$reason" || true
  exit 1
}

# --- Phase 5 success: prune unused Docker + deploy temps; keep disk data ----
cleanup_after_success() {
  echo "phase 5: success — prune unused Docker resources and deploy temps (keep disk data)"
  cleanup_candidate
  point_nginx_at_production

  # Image IDs from the generation we backed up at phase 3 (previous app).
  local -a old_ids=()
  local name id
  for name in app db kokoro whisper; do
    if [[ -f "${rollback}/images/${name}.id" ]]; then
      old_ids+=("$(cat "${rollback}/images/${name}.id")")
    fi
  done

  # Refresh predeploy tags to the NEW running generation (backup for next deploy).
  mkdir -p "${rollback}/images"
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
  printf '%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" >"${rollback}/created_at"

  # Drop stopped leftovers.
  docker container prune -f >/dev/null 2>&1 || true

  # Remove previous generation image IDs when nothing references them anymore.
  for id in "${old_ids[@]+"${old_ids[@]}"}"; do
    [[ -n "$id" ]] || continue
    docker rmi "$id" >/dev/null 2>&1 || true
  done

  # All unused images (running stack + uv-rollback:* tags on current IDs keep those).
  docker image prune -af >/dev/null 2>&1 || true

  # Unused networks only (in-use unlocked-venture is kept).
  docker network prune -f >/dev/null 2>&1 || true

  # Anonymous/unused volumes only — never UV_DATA_DIR / UV_MEDIA_DIR bind mounts.
  docker volume prune -f >/dev/null 2>&1 || true

  # Build cache from compose build --pull.
  docker builder prune -af >/dev/null 2>&1 || true

  # Deploy / build temp files under the app tree (never touch data/media dirs).
  rm -rf -- .deploy-tmp ./tmp 2>/dev/null || true
  find . -maxdepth 2 -type f \( \
      -name '*.tmp' \
      -o -name '*.temp' \
      -o -name '*~' \
      -o -name '*.swp' \
      -o -name 'docker-compose*.yml.bak' \
    \) ! -path './.deploy-rollback/*' -delete 2>/dev/null || true

  # Leftover candidate compose project artifacts (containers already removed).
  docker compose -p uv-candidate -f docker-compose.candidate.yml down \
    --rmi local --remove-orphans >/dev/null 2>&1 || true

  echo "cleanup done (unused containers/images/networks/volumes/build-cache/temps removed; UV_DATA_DIR / UV_MEDIA_DIR kept)"
}

# =============================================================================
# Main
# =============================================================================
if docker inspect app >/dev/null 2>&1; then
  had_previous=1
fi

trap 'rc=$?; if [[ "$rc" -ne 0 && "$rolling_back" -eq 0 ]]; then rollback_stack "unexpected failure (exit ${rc})" || true; fi; exit "$rc"' EXIT

ensure_stack_network
prepare_disk_mounts
ensure_predeploy_backup

echo "phase 4: build + near-zero-downtime cutover (release ${RELEASE_TAG})"
set +e
docker compose build --pull
build_rc=$?
set -e
if [[ "$build_rc" -ne 0 ]]; then
  fail_deploy "docker compose build failed (exit ${build_rc})"
fi

if [[ "$had_previous" -eq 0 ]]; then
  echo "first deploy: no previous app — compose up"
  set +e
  docker compose up -d --remove-orphans
  up_rc=$?
  set -e
  if [[ "$up_rc" -ne 0 ]]; then
    fail_deploy "first deploy compose up failed (exit ${up_rc})"
  fi

  set +e
  require_cms_schema
  schema_rc=$?
  set -e
  if [[ "$schema_rc" -ne 0 ]]; then
    fail_deploy "first deploy: CMS schema missing (import a database dump before serving)"
  fi

  set +e
  wait_http_ok "http://127.0.0.1:3000/" 90
  prod_rc=$?
  set -e
  if [[ "$prod_rc" -ne 0 ]]; then
    docker logs --tail 100 app >&2 || true
    fail_deploy "first deploy: production app health check failed on :3000"
  fi
else
  # Live app dual-homed in phase 1 so DB DNS stays up while workers recreate.
  set +e
  docker compose up -d --no-deps --remove-orphans db whisper kokoro
  workers_rc=$?
  set -e
  if [[ "$workers_rc" -ne 0 ]]; then
    fail_deploy "compose up for db/whisper/kokoro failed (exit ${workers_rc})"
  fi

  set +e
  require_cms_schema
  schema_rc=$?
  set -e
  if [[ "$schema_rc" -ne 0 ]]; then
    fail_deploy "CMS schema missing on live database (abort before cutover)"
  fi

  cleanup_candidate
  echo "starting app-candidate on 127.0.0.1:3001 (production :3000 still live)..."
  set +e
  docker compose -p uv-candidate -f docker-compose.candidate.yml up -d --no-build
  cand_rc=$?
  set -e
  if [[ "$cand_rc" -ne 0 ]]; then
    fail_deploy "app-candidate failed to start (exit ${cand_rc})"
  fi

  set +e
  wait_http_ok "http://127.0.0.1:3001/" 90
  health_rc=$?
  set -e
  if [[ "$health_rc" -ne 0 ]]; then
    docker logs --tail 100 app-candidate >&2 || true
    fail_deploy "app-candidate health check failed on :3001 (production left on :3000)"
  fi

  if [[ -x ./.github/scripts/nginx-uv-upstream-switch.sh ]]; then
    ./.github/scripts/nginx-uv-upstream-switch.sh 3001 || true
  fi

  echo "cutover: replacing production app on :3000 with new image..."
  set +e
  docker compose up -d --no-deps --no-build --force-recreate app
  app_rc=$?
  set -e
  if [[ "$app_rc" -ne 0 ]]; then
    fail_deploy "production app cutover failed (exit ${app_rc})"
  fi

  set +e
  wait_http_ok "http://127.0.0.1:3000/" 60
  prod_rc=$?
  set -e
  if [[ "$prod_rc" -ne 0 ]]; then
    docker logs --tail 100 app >&2 || true
    fail_deploy "production app health check failed on :3000 after cutover"
  fi

  if [[ -x ./.github/scripts/nginx-uv-upstream-switch.sh ]]; then
    ./.github/scripts/nginx-uv-upstream-switch.sh 3000 || true
  fi

  cleanup_candidate
fi

if ! containers_running; then
  for name in app db kokoro whisper; do
    if [[ "$(docker inspect -f '{{.State.Running}}' "$name" 2>/dev/null || echo false)" != true ]]; then
      docker logs --tail 80 "$name" >&2 || true
      fail_deploy "container not running after deploy: ${name}"
    fi
  done
fi

set +e
require_cms_schema
final_schema_rc=$?
set -e
if [[ "$final_schema_rc" -ne 0 ]]; then
  fail_deploy "CMS schema missing after deploy"
fi

echo "ok: app db kokoro whisper are running (release ${RELEASE_TAG})"
docker compose ps

# Clear EXIT trap before success cleanup so prune errors do not trigger rollback.
trap - EXIT
cleanup_after_success
REMOTE
