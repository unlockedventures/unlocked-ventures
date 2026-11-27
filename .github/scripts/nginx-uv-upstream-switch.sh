#!/usr/bin/env bash
# Flip host nginx between app :3000 and candidate :3001 for zero-downtime cutover.
#
# Requires the site to `include /etc/nginx/snippets/uv-backend.conf;`
# (see ensure-nginx-zero-downtime.sh — run that once/before cutover).
#
# Usage:
#   ./.github/scripts/nginx-uv-upstream-switch.sh 3001
#   ./.github/scripts/nginx-uv-upstream-switch.sh 3000
set -euo pipefail

port="${1:?port required (3000 or 3001)}"
if [[ "$port" != "3000" && "$port" != "3001" ]]; then
  echo "port must be 3000 or 3001" >&2
  exit 1
fi

snippet="${UV_NGINX_SNIPPET:-/etc/nginx/snippets/uv-backend.conf}"
site="${UV_NGINX_SITE:-/etc/nginx/sites-available/unlocked-venture}"

if ! command -v nginx >/dev/null 2>&1; then
  echo "::error::nginx missing — cannot switch upstream for zero-downtime cutover." >&2
  exit 1
fi

if [[ ! -d "$(dirname "$snippet")" ]]; then
  echo "::error::nginx snippet dir missing (${snippet})" >&2
  exit 1
fi

if [[ -f "$site" ]] && ! grep -Eq 'include[[:space:]]+/etc/nginx/snippets/uv-backend\.conf;' "$site"; then
  echo "::error::${site} does not include uv-backend.conf — run ensure-nginx-zero-downtime.sh first." >&2
  exit 1
fi

umask 022
cat >"$snippet" <<EOF
# Managed by unlocked-venture deploy — do not edit by hand during deploys.
proxy_pass http://127.0.0.1:${port};
EOF

nginx -t
nginx -s reload
echo "nginx upstream -> 127.0.0.1:${port}"
