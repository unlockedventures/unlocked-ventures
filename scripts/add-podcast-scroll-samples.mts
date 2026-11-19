import { getPayload } from 'payload'
import config from '@payload-config'

const resolvedConfig = await config
// This one-off fixture script must never run the application's general seeds/backfills.
const payload = await getPayload({ config: { ...resolvedConfig, onInit: undefined } })

const channels = await payload.find({
  collection: 'podcast-channels',
  where: { active: { equals: true } },
  limit: 100,
  depth: 0,
  sort: 'sortOrder',
  overrideAccess: true,
})
const existingEpisodes = await payload.find({
  collection: 'podcast-episodes',
  limit: 100,
  depth: 0,
  overrideAccess: true,
})
const thumbnails = existingEpisodes.docs.filter(
  (episode) => typeof episode.image === 'number' || /^https?:\/\//.test(episode.imageUrl || ''),
)
if (!thumbnails.length) throw new Error('An existing episode thumbnail is needed for sample content.')

let created = 0
let skipped = 0
for (const channel of channels.docs) {
  for (let index = 1; index <= 13; index += 1) {
    const slug = `ui-scroll-demo-${channel.id}-${String(index).padStart(2, '0')}`
    const existing = await payload.find({
      collection: 'podcast-episodes',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.totalDocs) {
      skipped += 1
      continue
    }

    const thumbnail = thumbnails[(index - 1) % thumbnails.length]
    const title = `[DEMO] ${channel.title} — episode ${String(index).padStart(2, '0')}`
    await payload.create({
      collection: 'podcast-episodes',
      overrideAccess: true,
      context: { skipAiContentSync: true },
      data: {
        title,
        slug,
        href: `/podcast/${slug}`,
        channel: channel.id,
        editorMode: 'manual',
        episodeStatus: 'complete',
        featured: false,
        heroFeatured: false,
        imageSource: typeof thumbnail.image === 'number' ? 'upload' : 'url',
        image: typeof thumbnail.image === 'number' ? thumbnail.image : undefined,
        imageUrl: typeof thumbnail.image === 'number' ? undefined : thumbnail.imageUrl,
        imageAlt: 'Demo episode thumbnail reused for podcast layout preview',
        meta: `${10 + index}:30`,
        guests: 'Demo host and guest',
        topic: 'Podcast browsing and channel context preview',
        excerpt: 'Sample content for manually checking card layout and the floating channel pill.',
        summary: 'This is clearly labeled demo content for previewing podcast browsing. It is not a recorded podcast and has no generated audio. Scroll through this channel and use See more to preview the floating channel reminder.',
        stats: 'Demo episode · UI preview',
        showDetailsSection: false,
      },
    })
    created += 1
  }
}
console.log(JSON.stringify({ created, skipped, channels: channels.docs.map(({ title }) => title) }))
process.exit(0)
