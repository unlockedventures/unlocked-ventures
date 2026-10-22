import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const source = readFileSync(
    fileURLToPath(new URL('../../scripts/ensure-rbac.sql', import.meta.url)),
    'utf8',
  )
  await db.execute(sql.raw(source))
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Preserve account grants and role data. Roll back application code separately.
}
