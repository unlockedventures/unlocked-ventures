#!/usr/bin/env node
/**
 * Applies additive, idempotent SQL against an existing Docker Postgres volume.
 * Fresh empty databases skip this and use Payload push instead.
 */
import { createRequire } from 'node:module'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sqlPath = join(__dirname, 'ensure-schema.sql')
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('ensure-schema: DATABASE_URL is required')
  process.exit(1)
}

function loadPg() {
  if (process.env.PG_PKG && existsSync(process.env.PG_PKG)) {
    return createRequire(process.env.PG_PKG)('pg')
  }

  try {
    return createRequire(import.meta.url)('pg')
  } catch {
    // Docker installs deps into a volume under node_modules/.pnpm.
  }

  const root = join(process.cwd(), 'node_modules', '.pnpm')
  const stack = [root]
  while (stack.length) {
    const dir = stack.pop()
    let entries = []
    try {
      entries = readdirSync(dir)
    } catch {
      continue
    }
    for (const name of entries) {
      const full = join(dir, name)
      if (name === 'package.json' && dir.replace(/\\/g, '/').endsWith('/node_modules/pg')) {
        return createRequire(full)('pg')
      }
      try {
        if (statSync(full).isDirectory()) stack.push(full)
      } catch {
        // ignore unreadable paths
      }
    }
  }

  throw new Error('pg package not found')
}

let pg
try {
  pg = loadPg()
} catch (error) {
  console.error('ensure-schema: could not load pg', error)
  process.exit(1)
}

const sql = readFileSync(sqlPath, 'utf8')
const client = new pg.Client({ connectionString: databaseUrl })

try {
  await client.connect()
  await client.query(sql)
  console.log('ensure-schema: applied additive schema updates')
} catch (error) {
  console.error('ensure-schema: failed', error)
  process.exit(1)
} finally {
  await client.end().catch(() => {})
}
