#!/usr/bin/env bash
# Optional: flip host nginx between app :3000 and candidate :3001 for true zero-downtime cutover.
# Enable by making this executable on the VPS and pointing nginx at the generated snippet.
#
# Example nginx (inside your site server block):
#   include /etc/nginx/snippets/uv-backend.conf;
#
# Usage (called by remote-compose-up.sh when executable):
#   ./.github/scripts/nginx-uv-upstream-switch.sh 3001
#   ./.github/scripts/nginx-uv-upstream-switch.sh 3000
set -euo pipefail

port="${1:?port required (3000 or 3001)}"
if [[ "$port" != "3000" && "$port" != "3001" ]]; then
  echo "port must be 3000 or 3001" >&2
  exit 1
fi

snippet="${UV_NGINX_SNIPPET:-/etc/nginx/snippets/uv-backend.conf}"
if [[ ! -d "$(dirname "$snippet")" ]]; then
  echo "nginx snippet dir missing (${snippet}); skip upstream switch" >&2
  exit 0
fi

umask 022
cat >"$snippet" <<EOF
# Managed by unlocked-venture deploy — do not edit by hand during deploys.
proxy_pass http://127.0.0.1:${port};
EOF

if command -v nginx >/dev/null && nginx -t; then
  nginx -s reload
  echo "nginx upstream -> 127.0.0.1:${port}"
else
  echo "nginx reload skipped (nginx missing or config test failed)" >&2
fi
