import type { PayloadHandler } from 'payload'
import { hasPermission } from '@/access/rbac'

export const dashboardStatsHandler: PayloadHandler = async (req) => {
  if (!req.user) return Response.json({ message: 'Unauthorized' }, { status: 401 })
  try {
    const collectionSlugs = [
      'users',
      'media',
      'awards',
      'news-posts',
      'podcast-audio',
      'podcast-channels',
      'podcast-episodes',
      'contact-messages',
    ] as const

    const readable: (typeof collectionSlugs)[number][] = []
    for (const slug of collectionSlugs) {
      if (await hasPermission(req, slug, 'read')) readable.push(slug)
    }
    const results = await Promise.all(
      readable.map(async (slug) => {
        const result = await req.payload.count({
          collection: slug,
          overrideAccess: false,
          req,
        })

        return [slug, result.totalDocs] as const
      }),
    )

    const stats = Object.fromEntries(results)

    return Response.json(stats)
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: 'Failed to fetch dashboard statistics',
    })

    return Response.json({ message: 'Failed to fetch dashboard statistics' }, { status: 500 })
  }
}
