import { getPayload } from 'payload'
import config from '@payload-config'

import { seedPodcastListing } from '../src/data/seed-podcast-listing.ts'

const payload = await getPayload({ config })
await seedPodcastListing(payload)
const listing = await payload.findGlobal({ slug: 'podcast-listing', depth: 0 })
const episodes = await payload.find({ collection: 'podcast-episodes', limit: 100, depth: 0 })
console.log(
  `Podcast listing seeded. categories=${listing.categories?.length ?? 0} subscribe=${listing.subscribe?.length ?? 0} episodes=${episodes.totalDocs}`,
)
process.exit(0)
