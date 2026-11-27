#!/usr/bin/env bash
# Validate release tag: prod-yyyy.MM.n  (n starts at 1, no leading zeros)
# Example: prod-2026.11.1
set -euo pipefail

tag="${1:-${GITHUB_REF_NAME:-}}"

if [[ -z "$tag" ]]; then
  echo '::error::No release tag provided (expected prod-yyyy.MM.n).' >&2
  exit 1
fi

if [[ ! "$tag" =~ ^prod-[0-9]{4}\.(0[1-9]|1[0-2])\.[1-9][0-9]*$ ]]; then
  echo "::error::Invalid release tag '${tag}'. Expected prod-yyyy.MM.n (e.g. prod-2026.11.1)." >&2
  exit 1
fi

echo "release tag ok: ${tag}"
