#!/bin/sh
# Legacy shell boot — production image is distroless and uses docker-app-entrypoint.mjs.
# Kept for rare non-distroless local debugging only.
set -eu
exec node /app/scripts/docker-app-entrypoint.mjs
