#!/usr/bin/env bash
# Install a pinned Gitleaks CLI and scan the repo (full git history).
# Used by .github/workflows/gitleaks.yml and deploy-ionos.yml.
set -euo pipefail

GITLEAKS_VERSION="${GITLEAKS_VERSION:-8.30.1}"
ROOT="${GITHUB_WORKSPACE:-$(pwd)}"
CONFIG="${ROOT}/.gitleaks.toml"

if [[ ! -f "$CONFIG" ]]; then
  echo "missing .gitleaks.toml at ${CONFIG}" >&2
  exit 1
fi

archive="gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
url="https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/${archive}"

tmpdir="$(mktemp -d)"
trap 'rm -rf -- "$tmpdir"' EXIT

curl -fsSL "$url" -o "${tmpdir}/${archive}"
tar -xzf "${tmpdir}/${archive}" -C "$tmpdir" gitleaks
sudo install -m 0755 "${tmpdir}/gitleaks" /usr/local/bin/gitleaks
gitleaks version

# --redact keeps secret values out of logs; --exit-code 1 fails the job on findings
gitleaks detect \
  --source "$ROOT" \
  --config "$CONFIG" \
  --verbose \
  --redact \
  --exit-code 1
