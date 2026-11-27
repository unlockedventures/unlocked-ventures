#!/usr/bin/env bash
# Fail unless the tagged commit is reachable from origin/deploy.
set -euo pipefail

: "${GITHUB_SHA:?}"
tag="${1:-${GITHUB_REF_NAME:-}}"

git fetch --no-tags origin deploy:refs/remotes/origin/deploy

if git merge-base --is-ancestor "$GITHUB_SHA" origin/deploy; then
  echo "tag ${tag} (${GITHUB_SHA:0:12}) is on origin/deploy"
  exit 0
fi

echo "::error::Tag '${tag}' commit ${GITHUB_SHA} is not on the deploy branch. Tag releases from deploy only." >&2
exit 1
