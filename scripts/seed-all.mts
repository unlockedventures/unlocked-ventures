/**
 * Seed CMS content for local / Docker development.
 *
 * Docker (app container must already be running):
 *   docker compose exec app sh -c 'PAYLOAD_DB_PUSH=false npx tsx scripts/seed-all.mts'
 *
 * Or via npm:
 *   docker compose exec app pnpm seed
 *
 * Local (Postgres reachable via DATABASE_URL):
 *   pnpm seed
 */
import { getPayload } from 'payload'
import config from '@payload-config'

import { classifyMedia } from '../src/data/classify-media.ts'
import { seedAbout } from '../src/data/seed-about.ts'
import { seedAwards } from '../src/data/seed-awards.ts'
import { seedAwardsSection } from '../src/data/seed-awards-section.ts'
import { seedContact } from '../src/data/seed-contact.ts'
import { seedDigitalEngineering } from '../src/data/seed-digital-engineering.ts'
import { seedFooter } from '../src/data/seed-footer.ts'
import { seedHeader } from '../src/data/seed-header.ts'
import { seedHero } from '../src/data/seed-hero.ts'
import { seedInsights } from '../src/data/seed-insights.ts'
import { seedLatestNews } from '../src/data/seed-latest-news.ts'
import { seedLocations } from '../src/data/seed-locations.ts'
import { seedNavigation } from '../src/data/seed-navigation.ts'
import { seedOurSuccesses } from '../src/data/seed-our-successes.ts'
import { seedPodcastListing } from '../src/data/seed-podcast-listing.ts'
import { seedPodcastPage } from '../src/data/seed-podcast-page.ts'
import { seedRecentPodcast } from '../src/data/seed-recent-podcast.ts'
import { seedSite } from '../src/data/seed-site.ts'
import { seedSolutions } from '../src/data/seed-solutions.ts'
import { seedStrategicAdvisory } from '../src/data/seed-strategic-advisory.ts'
import { seedSuccessStories } from '../src/data/seed-success-stories.ts'
import { seedTrustedBy } from '../src/data/seed-trusted-by.ts'

const episodeBriefDefaults = {
  about:
    'AI is already writing code, answering support tickets and drafting legal briefs. Three voices argue about what that means for the next ten years of work.',
  reading:
    'Our reading of the arguments presented in this episode highlights the key ideas, perspectives, and reasoning discussed throughout the conversation.',
  agree: [
    {
      title: 'Tasks disappear faster than jobs',
      body: 'Most roles will be reshaped long before they are removed. The work inside the job changes first.',
    },
    {
      title: 'Entry-level work is most exposed',
      body: 'Junior tasks like first drafts, data cleanup and basic QA are exactly what AI does well today.',
    },
    {
      title: 'Judgment becomes the premium skill',
      body: 'Knowing what to ask, what to trust and what to ship matters more when output is cheap.',
    },
  ],
  disagree: [
    {
      title: 'Everyone should learn to code',
      body: 'Coding alone is losing value. Domain knowledge paired with AI tools is the stronger bet.',
    },
    {
      title: 'New jobs will replace old ones automatically',
      body: 'They may, but not for the same people or in the same places without deliberate retraining.',
    },
    {
      title: 'Creative work is safe',
      body: 'Creative roles are changing as fast as any other. Taste is safer; production work is not.',
    },
  ],
  takeIntro:
    'The safest career move is not avoiding AI. It is becoming the person on your team who knows how to put it to work.',
  take: [
    {
      title: 'Map your week',
      body: 'List the tasks you repeat every week and mark which ones an AI tool could draft for you today.',
    },
    {
      title: 'Pick one tool and go deep',
      body: 'Use one assistant daily for a month instead of trying ten. Depth beats a long tool list.',
    },
    {
      title: 'Show the result, not the tool',
      body: 'Share one workflow you sped up. Measurable time saved is your new portfolio.',
    },
  ],
  transcript: [
    {
      time: '0:00',
      speaker: 'Saker Ghani',
      text: 'AI is already writing code, answering support tickets, and drafting legal briefs. Today we ask what that means for the next ten years of work.',
    },
    {
      time: '2:14',
      speaker: 'Maya Chen',
      text: 'The first thing I want to separate is tasks and jobs. Most roles will be reshaped long before they are removed.',
    },
    {
      time: '6:40',
      speaker: 'Omar Hassan',
      text: 'Entry-level work is the most exposed. First drafts, data cleanup, and basic QA are exactly what these tools do well today.',
    },
    {
      time: '11:05',
      speaker: 'Saker Ghani',
      text: 'A line we keep hearing is that everyone should learn to code. I do not think that is the bet.',
    },
  ],
}

const payload = await getPayload({ config })

const seeds: { name: string; run: () => Promise<void> }[] = [
  { name: 'awards', run: () => seedAwards(payload) },
  { name: 'awards-section', run: () => seedAwardsSection(payload) },
  { name: 'about', run: () => seedAbout(payload) },
  { name: 'hero', run: () => seedHero(payload) },
  { name: 'digital-engineering', run: () => seedDigitalEngineering(payload) },
  { name: 'footer', run: () => seedFooter(payload) },
  { name: 'header', run: () => seedHeader(payload) },
  { name: 'navigation', run: () => seedNavigation(payload) },
  { name: 'latest-news', run: () => seedLatestNews(payload) },
  { name: 'locations', run: () => seedLocations(payload) },
  { name: 'recent-podcast', run: () => seedRecentPodcast(payload) },
  { name: 'solutions', run: () => seedSolutions(payload) },
  { name: 'strategic-advisory', run: () => seedStrategicAdvisory(payload) },
  { name: 'trusted-by', run: () => seedTrustedBy(payload) },
  { name: 'success-stories', run: () => seedSuccessStories(payload) },
  { name: 'our-successes', run: () => seedOurSuccesses(payload) },
  { name: 'insights', run: () => seedInsights(payload) },
  { name: 'podcast-listing', run: () => seedPodcastListing(payload) },
  { name: 'podcast-page', run: () => seedPodcastPage(payload) },
  { name: 'contact', run: () => seedContact(payload) },
  { name: 'site', run: () => seedSite(payload) },
  { name: 'classify-media', run: () => classifyMedia(payload) },
]

let failed = 0
for (const seed of seeds) {
  try {
    await seed.run()
    console.log(`ok  ${seed.name}`)
  } catch (error) {
    failed += 1
    console.error(`fail ${seed.name}`, error)
  }
}

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
console.log('ok  podcast-page-labels')

await payload.updateGlobal({
  slug: 'podcast-listing',
  data: {
    uncategorizedLabel: 'Podcast',
    previousCategoriesLabel: 'Previous categories',
    nextCategoriesLabel: 'Next categories',
  },
})
console.log('ok  podcast-listing-labels')

const episodes = await payload.find({ collection: 'podcast-episodes', limit: 100, depth: 0 })
let episodeUpdates = 0
for (const episode of episodes.docs) {
  const data: Record<string, unknown> = {}
  if (!episode.about?.trim()) data.about = episodeBriefDefaults.about
  if (!episode.reading?.trim()) data.reading = episodeBriefDefaults.reading
  if (!episode.agree?.length) data.agree = episodeBriefDefaults.agree
  if (!episode.disagree?.length) data.disagree = episodeBriefDefaults.disagree
  if (!episode.takeIntro?.trim()) data.takeIntro = episodeBriefDefaults.takeIntro
  if (!episode.take?.length) data.take = episodeBriefDefaults.take
  if (!episode.transcript?.length) data.transcript = episodeBriefDefaults.transcript
  if (!episode.summary?.trim() && episode.excerpt) {
    data.summary = `${episode.excerpt} This conversation digs into what that means in practice for operators, founders, and engineers shipping under real constraints. Guests share what they would change next quarter.`
  }
  if (!episode.mainPoints?.length) {
    data.mainPoints = [
      { point: 'Clarify the problem before reaching for a new tool.' },
      { point: 'Keep humans in the loop where risk or judgment matters.' },
      { point: 'Measure outcomes, not just activity or model output.' },
    ]
  }
  if (Object.keys(data).length === 0) continue
  await payload.update({ collection: 'podcast-episodes', id: episode.id, data })
  episodeUpdates += 1
}
console.log(`ok  podcast-episode-briefs (updated=${episodeUpdates}/${episodes.totalDocs})`)

if (failed > 0) {
  console.error(`Seed finished with ${failed} failure(s).`)
  process.exit(1)
}

console.log('Seed complete.')
process.exit(0)
