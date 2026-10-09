import { getPayload } from 'payload'
import config from '@payload-config'

import { seedPodcastListing } from '../src/data/seed-podcast-listing.ts'

const sharedBrief = {
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
await seedPodcastListing(payload)

const episodes = await payload.find({ collection: 'podcast-episodes', limit: 100, depth: 0 })
let updated = 0

for (const episode of episodes.docs) {
  const data: Record<string, unknown> = {}
  if (!episode.about?.trim()) data.about = sharedBrief.about
  if (!episode.reading?.trim()) data.reading = sharedBrief.reading
  if (!episode.agree?.length) data.agree = sharedBrief.agree
  if (!episode.disagree?.length) data.disagree = sharedBrief.disagree
  if (!episode.takeIntro?.trim()) data.takeIntro = sharedBrief.takeIntro
  if (!episode.take?.length) data.take = sharedBrief.take
  if (!episode.transcript?.length) data.transcript = sharedBrief.transcript
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
  updated += 1
  console.log(`updated ${episode.slug}: ${Object.keys(data).join(', ')}`)
}

console.log(`Episode briefs seeded. episodes=${episodes.totalDocs} updated=${updated}`)
process.exit(0)
