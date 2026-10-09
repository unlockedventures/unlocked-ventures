import { getPayload } from 'payload'
import config from '@payload-config'

import { seedPodcastListing } from '../src/data/seed-podcast-listing.ts'
import { seedPodcastPage } from '../src/data/seed-podcast-page.ts'

const payload = await getPayload({ config })

await seedPodcastListing(payload)
await seedPodcastPage(payload)

await payload.updateGlobal({
  slug: 'podcast-page',
  data: {
    shareLabel: 'Share',
    saveLabel: 'Save',
    likeLabel: 'Like',
    transcriptLabel: 'Read transcript',
    transcriptDialogTitle: 'Transcript',
    closeTranscriptLabel: 'Close transcript',
    aboutTitle: 'About this episode',
    mainPointsTitle: 'Main points',
    stanceTitle: "Where we agree and where we don't",
    agreeTitle: 'We agree',
    disagreeTitle: 'We disagree',
    takeTitle: 'The Unlocked Ventures take',
    loadMoreLabel: 'Load more',
    listenNextTitle: 'Listen next',
    allEpisodesLabel: 'All episodes',
    allEpisodesHref: '/podcast',
    subscribeTitle: 'Subscribe on',
  },
})

await payload.updateGlobal({
  slug: 'podcast-listing',
  data: {
    uncategorizedLabel: 'Podcast',
    previousCategoriesLabel: 'Previous categories',
    nextCategoriesLabel: 'Next categories',
  },
})

const listing = await payload.findGlobal({ slug: 'podcast-listing', depth: 0 })
const page = await payload.findGlobal({ slug: 'podcast-page', depth: 0 })
console.log(
  `CMS labels seeded. listing.uncategorized=${listing.uncategorizedLabel} page.aboutTitle=${page.aboutTitle} page.loadMore=${page.loadMoreLabel}`,
)
process.exit(0)
