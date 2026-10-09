import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

const ensureSchemaPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../scripts/ensure-schema.sql',
)

/**
 * Additive schema for databases created before newer Payload fields existed.
 * SQL is idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS), so re-running is safe.
 * Fresh empty DBs are still created via Payload push in docker-dev.
 */
export async function up(_args: MigrateUpArgs): Promise<void> {
  const require = createRequire(import.meta.url)
  const pg = require('pg') as typeof import('pg')
  const sql = readFileSync(ensureSchemaPath, 'utf8')
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })

  try {
    await client.connect()
    await client.query(sql)
  } finally {
    await client.end().catch(() => {})
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Additive only — do not drop columns/tables so older code revisions keep working.
}
