#!/bin/sh
set -e

corepack enable
# `corepack enable` only adds a shim. Activate an exact pnpm 10 release so
# startup does not resolve "pnpm@10" against the registry with no terminal.
ok=0
i=0
while [ "$i" -lt 5 ]; do
  if corepack prepare pnpm@10.34.6 --activate; then
    ok=1
    break
  fi
  i=$((i + 1))
  echo "Could not download pnpm, retry $i"
  sleep 5
done
if [ "$ok" -ne 1 ]; then
  echo "Could not activate pnpm"
  exit 1
fi
pnpm install --frozen-lockfile

if [ -n "$DATABASE_URL" ]; then
  DATABASE_URL=$(printf '%s' "$DATABASE_URL" | sed 's/127.0.0.1/host.docker.internal/')
  export DATABASE_URL
fi

# Payload asks before a schema push that would drop tables. `docker compose up`
# has no terminal, so that question never gets an answer and the app never serves.
# Create tables on an empty database. Leave an existing database alone, then
# apply additive IF NOT EXISTS updates so older volumes keep working with new code.
PAYLOAD_DB_PUSH=true
DB_EXISTS=0
PG_PKG=$(find /app/node_modules/.pnpm -path '*/node_modules/pg/package.json' | head -n 1)
if [ -n "$PG_PKG" ] && PG_PKG="$PG_PKG" node --input-type=module <<'EOF'
import { createRequire } from 'node:module'

const require = createRequire(process.env.PG_PKG)
const pg = require('pg')
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
try {
  await client.connect()
  const result = await client.query("select to_regclass('public.users') as users")
  if (result.rows[0]?.users) process.exit(0)
} catch {
  // A missing database still needs the dev schema push.
} finally {
  await client.end().catch(() => {})
}
process.exit(1)
EOF
then
  PAYLOAD_DB_PUSH=false
  DB_EXISTS=1
fi
export PAYLOAD_DB_PUSH
echo "PAYLOAD_DB_PUSH=$PAYLOAD_DB_PUSH"

if [ "$DB_EXISTS" -eq 1 ]; then
  echo "Existing database detected — applying additive schema ensure"
  PG_PKG="$PG_PKG" node /app/scripts/ensure-schema.mjs
fi

exec pnpm dev --hostname 0.0.0.0 --port 3000
