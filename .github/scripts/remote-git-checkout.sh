#!/usr/bin/env bash
# SSH to the VPS and check out the release tag (or main branch for manual runs).
#
# For private GitHub repos the VPS must fetch over SSH with a read-only deploy key.
# This script re-asserts that origin URL + SSH host alias on every deploy so making
# the repository private does not break tag checkout.
#
# Default origin (override with secret/env IONOS_GIT_ORIGIN_URL):
#   git@github.com-unlocked-ventures:unlockedventures/unlocked-ventures.git
# Deploy key private file on VPS (override with IONOS_GIT_SSH_KEY):
#   /root/.ssh/unlocked_ventures_deploy
set -euo pipefail

: "${IONOS_HOST:?}"
: "${IONOS_SSH_USER:?}"
: "${IONOS_APP_PATH:?}"

# shellcheck source=ionos-ssh.sh
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ionos-ssh.sh"

release_tag="${DEPLOY_TAG:-${GITHUB_REF_NAME:-}}"
event_name="${GITHUB_EVENT_NAME:-}"
git_origin_url="${IONOS_GIT_ORIGIN_URL:-git@github.com-unlocked-ventures:unlockedventures/unlocked-ventures.git}"
git_ssh_key="${IONOS_GIT_SSH_KEY:-/root/.ssh/unlocked_ventures_deploy}"

remote="${IONOS_SSH_USER}@${IONOS_HOST}"

ionos_ssh "$remote" \
  "export APP_PATH=$(printf '%q' "$IONOS_APP_PATH"); \
   export RELEASE_TAG=$(printf '%q' "$release_tag"); \
   export EVENT_NAME=$(printf '%q' "$event_name"); \
   export GIT_ORIGIN_URL=$(printf '%q' "$git_origin_url"); \
   export GIT_SSH_KEY=$(printf '%q' "$git_ssh_key"); \
   bash -s" <<'REMOTE'
set -euo pipefail

if [[ ! -d "$APP_PATH" ]]; then
  echo "::error::IONOS_APP_PATH does not exist on the VPS: ${APP_PATH}. Clone the repo there once, then redeploy." >&2
  exit 1
fi

cd "$APP_PATH"

if [[ ! -d .git ]]; then
  echo "::error::${APP_PATH} is not a git clone. On the VPS: git clone <repo> ${APP_PATH}" >&2
  exit 1
fi

command -v git >/dev/null

# --- Ensure private-repo-safe git remote (SSH deploy key) ---------------------
ensure_github_deploy_key_remote() {
  local key_path="$GIT_SSH_KEY"
  local origin_url="$GIT_ORIGIN_URL"
  local ssh_dir ssh_config known_hosts

  ssh_dir="$(dirname "$key_path")"
  ssh_config="${ssh_dir}/config"
  known_hosts="${ssh_dir}/known_hosts"

  if [[ ! -f "$key_path" ]]; then
    echo "::error::VPS deploy key missing at ${key_path}. Add a read-only GitHub Deploy key and keep the private key on the VPS before making the repo private." >&2
    exit 1
  fi
  chmod 600 "$key_path" 2>/dev/null || true
  if [[ -f "${key_path}.pub" ]]; then
    chmod 644 "${key_path}.pub" 2>/dev/null || true
  fi

  mkdir -p "$ssh_dir"
  chmod 700 "$ssh_dir"
  touch "$known_hosts"
  chmod 600 "$known_hosts"
  if ! grep -q 'github.com' "$known_hosts" 2>/dev/null; then
    ssh-keyscan -H github.com >>"$known_hosts" 2>/dev/null || true
  fi

  touch "$ssh_config"
  chmod 600 "$ssh_config"
  if ! grep -q 'Host github.com-unlocked-ventures' "$ssh_config" 2>/dev/null; then
    cat >>"$ssh_config" <<EOF

Host github.com-unlocked-ventures
  HostName github.com
  User git
  IdentityFile ${key_path}
  IdentitiesOnly yes
EOF
  fi

  # Always re-point origin so a leftover public HTTPS remote cannot break private fetches.
  if git remote get-url origin >/dev/null 2>&1; then
    git remote set-url origin "$origin_url"
  else
    git remote add origin "$origin_url"
  fi

  echo "origin=$(git remote get-url origin)"

  # Quick auth probe (GitHub returns exit 1 even on success — match banner text).
  local auth_out
  set +e
  auth_out="$(ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -T git@github.com-unlocked-ventures 2>&1)"
  set -e
  if ! printf '%s' "$auth_out" | grep -Eqi 'successfully authenticated|Hi '; then
    echo "::error::GitHub deploy-key SSH auth failed for github.com-unlocked-ventures. Check Deploy keys on unlockedventures/unlocked-ventures (read-only) and ${key_path} on the VPS." >&2
    printf '%s\n' "$auth_out" >&2
    exit 1
  fi
  echo "github deploy-key auth ok"
}

ensure_github_deploy_key_remote

echo "git fetch origin (tags + main)..."
if ! git fetch --prune --force origin '+refs/tags/prod-*:refs/tags/prod-*' '+refs/heads/main:refs/remotes/origin/main'; then
  echo "::error::git fetch failed. If the GitHub repo is private, the VPS must use the read-only deploy key SSH remote (not anonymous HTTPS)." >&2
  exit 1
fi

if [[ "$EVENT_NAME" == "workflow_dispatch" && ! "$RELEASE_TAG" =~ ^prod-[0-9]{4}\.(0[1-9]|1[0-2])\.[1-9][0-9]*$ ]]; then
  echo "manual dispatch without prod tag — checking out origin/main"
  git checkout -f -B main origin/main
else
  if [[ -z "$RELEASE_TAG" ]]; then
    echo "::error::No RELEASE_TAG / DEPLOY_TAG for git checkout." >&2
    exit 1
  fi
  if ! git rev-parse -q --verify "refs/tags/${RELEASE_TAG}" >/dev/null; then
    echo "::error::Tag ${RELEASE_TAG} not found on VPS after fetch. Push the tag to origin first." >&2
    exit 1
  fi
  echo "git checkout tag ${RELEASE_TAG}"
  git checkout -f "refs/tags/${RELEASE_TAG}"
fi

echo "HEAD=$(git rev-parse --short HEAD) $(git describe --tags --always 2>/dev/null || true)"
REMOTE
