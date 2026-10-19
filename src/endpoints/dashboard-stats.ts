import type { PayloadHandler } from 'payload'

export const dashboardStatsHandler: PayloadHandler = async (req) => {
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

    const results = await Promise.all(
      collectionSlugs.map(async (slug) => {
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
