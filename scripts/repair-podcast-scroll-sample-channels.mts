/**
 * Restore UI scroll demo episodes (`ui-scroll-demo-<channelId>-NN`) to the channel encoded in
 * their slug, with the excerpt/stats written by add-podcast-scroll-samples.mts. Earlier startup
 * seeds moved them to "Digital engineering". Only demo slugs are touched; safe to re-run.
 *
 *   docker compose exec app sh -c 'PAYLOAD_DB_PUSH=false npx tsx scripts/repair-podcast-scroll-sample-channels.mts'
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const DEMO_EXCERPT =
  'Sample content for manually checking card layout and the floating channel pill.'
const DEMO_STATS = 'Demo episode · UI preview'
const DEMO_SLUG = /^ui-scroll-demo-(\d+)-\d+$/

const resolvedConfig = await config
// One-off fixture script: never run the application's general seeds/backfills.
const payload = await getPayload({ config: { ...resolvedConfig, onInit: undefined } })

const channels = await payload.find({
  collection: 'podcast-channels',
  pagination: false,
  depth: 0,
  overrideAccess: true,
})
const channelIds = new Set(channels.docs.map((channel) => channel.id))

const episodes = await payload.find({
  collection: 'podcast-episodes',
  where: { slug: { like: 'ui-scroll-demo-' } },
  pagination: false,
  depth: 0,
  overrideAccess: true,
})

let updated = 0
let unchanged = 0
let skipped = 0
for (const episode of episodes.docs) {
  const match = DEMO_SLUG.exec(episode.slug ?? '')
  const channelId = match ? Number(match[1]) : NaN
  if (!channelIds.has(channelId)) {
    skipped += 1
    continue
  }

  const currentChannel = typeof episode.channel === 'object' ? episode.channel?.id : episode.channel
  if (
    currentChannel === channelId &&
    episode.excerpt === DEMO_EXCERPT &&
    episode.stats === DEMO_STATS &&
    !episode.heroFeatured
  ) {
    unchanged += 1
    continue
  }

  await payload.update({
    collection: 'podcast-episodes',
    id: episode.id,
    overrideAccess: true,
    context: { skipAiContentSync: true },
    data: {
      // The collection's beforeChange hook syncs category to the channel title.
      channel: channelId,
      excerpt: DEMO_EXCERPT,
      stats: DEMO_STATS,
      heroFeatured: false,
    },
  })
  updated += 1
}

console.log(JSON.stringify({ updated, unchanged, skipped, total: episodes.totalDocs }))
process.exit(0)
