#!/usr/bin/env bash
# Fail fast when required deploy env vars are empty (names only — never print values).
set -euo pipefail

missing=0
for name in "$@"; do
  # indirect expansion: value of variable whose name is $name
  if [[ -z "${!name:-}" ]]; then
    echo "::error::Missing required secret/env: ${name}" >&2
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  echo '::error::Add the secrets above under Repo Settings → Secrets and variables → Actions.' >&2
  exit 1
fi
