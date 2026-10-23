import { randomUUID } from 'node:crypto'
import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import type { Endpoint } from 'payload'
import { hasPermission } from '@/access/rbac'

/** Claim in PostgreSQL so concurrent workers cannot start conflicting paid operations. */
export function withEpisodeGenerationLock(handler: Endpoint['handler']): Endpoint['handler'] {
  return async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })
    if (!(await hasPermission(req, 'podcast-episodes', 'read')) ||
        !(await hasPermission(req, 'podcast-episodes', 'update'))) {
      return Response.json({ error: 'Permission denied.' }, { status: 403 })
    }
    const body = req.json ? await req.json().catch(() => null) : null
    const id = body?.id
    if ((typeof id !== 'string' && typeof id !== 'number') || !/^\d+$/.test(String(id))) {
      return Response.json({ error: 'Episode not found.' }, { status: 404 })
    }
    const doc = await req.payload.findByID({
      collection: 'podcast-episodes', id, depth: 0, req, overrideAccess: false,
    }).catch(() => null)
    if (!doc) return Response.json({ error: 'Episode not found.' }, { status: 404 })
    req.json = async () => body
    const token = randomUUID()
    const db = req.payload.db as PostgresAdapter
    let claimed
    try {
      claimed = await db.drizzle.execute(sql`
      UPDATE podcast_episodes SET generation_lock = ${token},
        generation_lock_expires_at = NOW() + INTERVAL '1 hour',
        status = CASE WHEN generation_lock_expires_at < NOW() AND status = 'processing' THEN 'error' ELSE status END,
        script_status = CASE WHEN generation_lock_expires_at < NOW() AND script_status = 'processing' THEN 'error' ELSE script_status END,
        audio_status = CASE WHEN generation_lock_expires_at < NOW() AND audio_status = 'processing' THEN 'error' ELSE audio_status END,
        source_summary_status = CASE WHEN generation_lock_expires_at < NOW() AND source_summary_status = 'processing' THEN 'error' ELSE source_summary_status END
      WHERE id = ${Number(id)} AND (
        generation_lock_expires_at < NOW() OR (
          generation_lock IS NULL
          AND COALESCE(status::text, '') <> 'processing'
          AND COALESCE(script_status::text, '') <> 'processing'
          AND COALESCE(audio_status::text, '') <> 'processing'
          AND COALESCE(source_summary_status, '') <> 'processing'
        )
      )
      RETURNING id
    `)
    } catch {
      return Response.json({ error: 'Could not start episode generation. Confirm the source-summary schema rollout is complete and try again.' }, { status: 503 })
    }
    if (!claimed.rows.length) {
      return Response.json({ error: 'Wait for the current episode generation to finish before starting another action.' }, { status: 409 })
    }
    try {
      req.context.episodeGenerationToken = token
      const response = await handler(req)
      if (response.status >= 500) throw new Error('Episode generation failed.')
      return response
    } catch {
      // Preserve previous generated content and allow another attempt after a failed operation.
      const current = await req.payload.findByID({
        collection: 'podcast-episodes', id, depth: 0, req, overrideAccess: false,
      }).catch(() => null)
      if (current?.generationLock === token) {
        await req.payload.update({
          collection: 'podcast-episodes', id, req, overrideAccess: false,
          data: {
            ...(current.status === 'processing' ? { status: 'error', statusMessage: 'Generation failed. Try again.' } : {}),
            ...(current.scriptStatus === 'processing' ? { scriptStatus: 'error', scriptStatusMessage: 'Generation failed. Check the current source summary and try again.' } : {}),
            ...(current.audioStatus === 'processing' ? { audioStatus: 'error', audioStatusMessage: 'Generation failed. Try again.' } : {}),
            ...(current.sourceSummaryStatus === 'processing' ? { sourceSummaryStatus: 'error', sourceSummaryMessage: 'Source summary generation failed. Try again.' } : {}),
          },
          context: { skipAiContentSync: true, sourceSummaryUpdate: true, expectedSourceRevision: undefined },
        }).catch(() => { /* Retain the lease for recovery if error-state persistence fails. */ })
      }
      return Response.json({ error: 'Episode generation failed. Check the current sources and try again.' }, { status: 500 })
    } finally {
      await db.drizzle.execute(sql`
        UPDATE podcast_episodes SET generation_lock = NULL, generation_lock_expires_at = NULL
        WHERE id = ${Number(id)} AND generation_lock = ${token}
          AND COALESCE(status::text, '') <> 'processing'
          AND COALESCE(script_status::text, '') <> 'processing'
          AND COALESCE(audio_status::text, '') <> 'processing'
          AND COALESCE(source_summary_status, '') <> 'processing'
      `).catch(() => { /* The bounded lease permits recovery if the database is temporarily unavailable. */ })
    }
  }
}
