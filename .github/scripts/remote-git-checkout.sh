#!/usr/bin/env bash
# SSH to the VPS and check out the release tag (or deploy branch for manual runs).
# IONOS_APP_PATH must already be a git clone with fetch access to origin.
set -euo pipefail

: "${IONOS_HOST:?}"
: "${IONOS_SSH_USER:?}"
: "${IONOS_APP_PATH:?}"

# shellcheck source=ionos-ssh.sh
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/ionos-ssh.sh"

release_tag="${DEPLOY_TAG:-${GITHUB_REF_NAME:-}}"
event_name="${GITHUB_EVENT_NAME:-}"

remote="${IONOS_SSH_USER}@${IONOS_HOST}"

ionos_ssh "$remote" \
  "export APP_PATH=$(printf '%q' "$IONOS_APP_PATH"); export RELEASE_TAG=$(printf '%q' "$release_tag"); export EVENT_NAME=$(printf '%q' "$event_name"); bash -s" <<'REMOTE'
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

git remote get-url origin >/dev/null

echo "git fetch origin (tags + deploy)..."
git fetch --prune --force origin '+refs/tags/prod-*:refs/tags/prod-*' '+refs/heads/deploy:refs/remotes/origin/deploy'

if [[ "$EVENT_NAME" == "workflow_dispatch" && ! "$RELEASE_TAG" =~ ^prod-[0-9]{4}\.(0[1-9]|1[0-2])\.[1-9][0-9]*$ ]]; then
  echo "manual dispatch without prod tag — checking out origin/deploy"
  git checkout -f -B deploy origin/deploy
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
