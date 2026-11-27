#!/usr/bin/env bash
# Wire host nginx so deploys can flip traffic between :3000 (app) and :3001 (candidate)
# without downtime. Idempotent — safe to run on every deploy.
#
# Replaces hardcoded `proxy_pass http://127.0.0.1:3000;` with:
#   include /etc/nginx/snippets/uv-backend.conf;
# and ensures that snippet exists (default → :3000).
set -euo pipefail

snippet="${UV_NGINX_SNIPPET:-/etc/nginx/snippets/uv-backend.conf}"
site="${UV_NGINX_SITE:-/etc/nginx/sites-available/unlocked-venture}"

if ! command -v nginx >/dev/null 2>&1; then
  echo "nginx not installed — skip zero-downtime edge wiring" >&2
  exit 0
fi

if [[ ! -d "$(dirname "$snippet")" ]]; then
  echo "::error::nginx snippets dir missing: $(dirname "$snippet")" >&2
  exit 1
fi

umask 022
if [[ ! -f "$snippet" ]]; then
  cat >"$snippet" <<EOF
# Managed by unlocked-venture deploy — do not edit by hand during deploys.
proxy_pass http://127.0.0.1:3000;
EOF
  echo "created ${snippet} → :3000"
fi

if [[ ! -f "$site" ]]; then
  echo "nginx site ${site} missing — skip auto-wire (manual edge?)" >&2
  exit 0
fi

if grep -Fq "include ${snippet};" "$site" \
  || grep -Fq 'include /etc/nginx/snippets/uv-backend.conf;' "$site"; then
  echo "nginx already includes uv-backend snippet"
else
  if ! grep -Eq 'proxy_pass[[:space:]]+http://127\.0\.0\.1:3000;' "$site"; then
    echo "::error::Cannot auto-wire ${site}: no proxy_pass to 127.0.0.1:3000 and no uv-backend include." >&2
    exit 1
  fi
  # Keep a one-time backup beside the site file.
  if [[ ! -f "${site}.uv-zdt.bak" ]]; then
    cp -a "$site" "${site}.uv-zdt.bak"
  fi
  # shellcheck disable=SC2016
  sed -i 's|proxy_pass[[:space:]]\+http://127\.0\.0\.1:3000;|include /etc/nginx/snippets/uv-backend.conf;|g' "$site"
  if ! grep -Fq 'include /etc/nginx/snippets/uv-backend.conf;' "$site"; then
    echo "::error::Failed to wire uv-backend include into ${site}" >&2
    exit 1
  fi
  echo "wired ${site} to include uv-backend.conf"
fi

nginx -t
nginx -s reload
echo "nginx zero-downtime edge ready (snippet ${snippet})"
