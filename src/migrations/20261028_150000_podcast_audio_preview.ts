import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { sql, type MigrateDownArgs, type MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql.raw(
      readFileSync(
        fileURLToPath(new URL('../../scripts/ensure-podcast-audio-preview.sql', import.meta.url)),
        'utf8',
      ),
    ),
  )
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Preserve pending previews on application rollback.
}
