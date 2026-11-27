#!/usr/bin/env bash
# Fail unless the tagged commit is reachable from origin/main.
set -euo pipefail

: "${GITHUB_SHA:?}"
tag="${1:-${GITHUB_REF_NAME:-}}"

git fetch --no-tags origin main:refs/remotes/origin/main

if git merge-base --is-ancestor "$GITHUB_SHA" origin/main; then
  echo "tag ${tag} (${GITHUB_SHA:0:12}) is on origin/main"
  exit 0
fi

echo "::error::Tag '${tag}' commit ${GITHUB_SHA} is not on the main branch. Tag releases from main only." >&2
exit 1
