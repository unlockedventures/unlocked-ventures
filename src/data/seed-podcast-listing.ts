import path from 'path'
import type { Payload } from 'payload'

import { ensurePodcastChannel } from '@/data/ensure-podcast-channel'
import { uploadPublicFile as createPublicFile } from '@/data/upload-public-file'

const listingSeed = {
  metaTitle: 'Podcast',
  metaDescription:
    'Listen to Unlocked Ventures podcasts on healthcare, AI, digital engineering, and growth.',
  homeLabel: 'Home',
  homeHref: '/',
  currentLabel: 'Podcast',
  title: 'The Unlocked Podcast',
  description:
    'Conversations with operators, founders and engineers about building products, adopting AI and running technology change inside real businesses.',
  watchNowLabel: 'Watch now',
  browseTitle: 'Browse by category',
  viewAllCategoriesLabel: 'View all categories',
  categories: [
    { label: 'AI in Business' },
    { label: 'Strategy & Growth' },
    { label: 'Build & Engineering' },
    { label: 'Design & Product' },
    { label: 'Startups & Funding' },
    { label: 'Tech Policy & Ethics' },
    { label: 'Future of Work' },
  ],
  featuredTitle: 'Featured podcast',
  exploreTitle: 'Explore all podcast',
  sortLabel: 'Select category',
  sortAllLabel: 'All',
  uncategorizedLabel: 'Podcast',
  previousCategoriesLabel: 'Previous categories',
  nextCategoriesLabel: 'Next categories',
  seeMoreLabel: 'See more',
  emptyLabel: 'No episodes yet.',
  subscribeTitle: 'Subscribe to Future of Work',
  subscribeDescription: 'New episodes every Wednesday, about 25 minutes each.',
}

type EpisodeSeedMeta = {
  category: string
  excerpt: string
  stats: string
  heroFeatured?: boolean
  title?: string
  summary?: string
  mainPoints?: { point: string }[]
}

const episodeMeta: Record<string, EpisodeSeedMeta> = {
  'how-tech-will-and-wont-replace-your-doctor': {
    category: 'Digital engineering',
    excerpt:
      'Since 2019, over a thousand warehouse campuses have popped up around the world. Each complex covers nearly 100,000 square meters — facilities for running and training Large Language Models.',
    stats: '135K plays · 12 days ago',
    heroFeatured: true,
    summary:
      'AI is already writing code, answering support tickets and drafting legal briefs. Three voices argue about what that means for the next ten years of work: which roles shrink, which grow, and which skills will still be worth paying for. We look at entry-level jobs, the rise of AI agents in business teams, and what workers in fast-growing markets like South Asia should do differently.',
    mainPoints: [
      { point: 'Tasks disappear faster than jobs — most roles are reshaped before they are removed.' },
      { point: 'Entry-level work is most exposed: first drafts, data cleanup, and basic QA.' },
      { point: 'Judgment becomes the premium skill when output is cheap.' },
      { point: 'Domain knowledge paired with AI tools beats learning to code alone.' },
      { point: 'Show measurable time saved — results are the new portfolio.' },
    ],
  },
  'the-future-of-ai-in-mental-health-care': {
    category: 'Future',
    excerpt: 'How AI tools are reshaping mental health care without replacing clinical judgment.',
    stats: '98K plays · 3 weeks ago',
    summary:
      'Clinicians and builders debate how AI can expand access to mental health support without eroding trust. The conversation covers triage bots, therapist-in-the-loop tools, and the risks of over-automating sensitive care. Guests argue that clinical judgment stays central even as software takes on more routine check-ins.',
    mainPoints: [
      { point: 'AI can widen access to intake and follow-up without replacing therapists.' },
      { point: 'Human oversight remains essential for risk and crisis moments.' },
      { point: 'Trust and privacy design decide whether patients keep using the tools.' },
    ],
  },
  'wearable-tech-revolutionizing-fitness-tracking': {
    category: 'Communication',
    excerpt: 'What fitness wearables get right, and what still fails when care teams need the data.',
    stats: '76K plays · 1 month ago',
    summary:
      'Wearables generate a flood of personal health signals, but care teams still struggle to turn that stream into decisions. This episode separates marketing claims from clinically useful metrics and asks what would make consumer data trustworthy in a clinic. Guests map the gap between fitness dashboards and medical workflows.',
    mainPoints: [
      { point: 'Consumer wearables excel at trends, not diagnosis.' },
      { point: 'Clinics need cleaner, consented data handoffs — not more raw dumps.' },
      { point: 'Context and calibration matter more than another chart on a phone.' },
    ],
  },
  'how-clinics-can-use-ai-without-losing-the-patient': {
    category: 'Artificial intelligence (AI)',
    excerpt: 'Practical ways clinics can adopt AI while keeping patients at the center of care.',
    stats: '112K plays · 5 days ago',
    summary:
      'Clinic operators share how they introduce AI into scheduling, documentation, and triage without making patients feel processed. The episode focuses on change management, staff training, and clear escalation paths when software is wrong. The through-line is keeping the patient relationship visible at every step.',
    mainPoints: [
      { point: 'Start with admin burden, not the clinical encounter.' },
      { point: 'Train staff to override the model — and reward that judgment.' },
      { point: 'Tell patients when AI is in the loop and how to escalate.' },
    ],
  },
  'what-wearable-data-is-still-missing-in-care': {
    category: 'Digital engineering',
    excerpt: 'The gaps between consumer wearables and clinical workflows that still need closing.',
    stats: '64K plays · 2 weeks ago',
    summary:
      'Engineers and clinicians inventory what wearable data still fails to deliver in real care settings. Missing context, poor interoperability, and alert fatigue show up again and again. The guests outline the product work required before continuous monitoring becomes routine.',
    mainPoints: [
      { point: 'Interoperability and standards are still the bottleneck.' },
      { point: 'Alerts without workflows create noise, not outcomes.' },
      { point: 'Missing social and environmental context limits clinical value.' },
    ],
  },
  'a-clearer-way-to-talk-about-clinical-risk': {
    category: 'Communication',
    excerpt: 'How teams can talk about clinical risk without drowning stakeholders in jargon.',
    stats: '51K plays · 8 days ago',
    summary:
      'Leaders need a shared language for clinical risk that executives and frontline staff both trust. This episode walks through framing, probability language, and decision logs that keep risk conversations grounded. Guests show how unclear communication creates false certainty and stalled decisions.',
    mainPoints: [
      { point: 'Separate uncertainty from urgency when briefing stakeholders.' },
      { point: 'Use plain language ranges instead of false precision.' },
      { point: 'Write decisions down so risk talk becomes action, not theater.' },
    ],
  },
  'hohow-to-make-stress-your-friend': {
    category: 'Future',
    excerpt: 'Reframing stress as a signal teams can use when shipping under pressure.',
    stats: '41K plays · 4 days ago',
    title: 'How to Make Stress Your Friend',
    summary:
      'Stress is not only a cost — it can be a signal that priorities are unclear or capacity is overloaded. Guests reframe pressure as information for shipping teams, with practices that convert anxiety into clearer tradeoffs. The episode avoids hustle culture and focuses on sustainable ways to stay sharp.',
    mainPoints: [
      { point: 'Treat stress as a signal about scope and support, not a personal failure.' },
      { point: 'Name the tradeoff early — time, quality, or scope has to move.' },
      { point: 'Recovery is part of delivery, not a reward after the sprint.' },
    ],
  },
}

async function findOrUploadPublicFile(payload: Payload, relativePath: string, alt: string) {
  const name = path.basename(relativePath)
  const stem = path.parse(name).name
  const existing = await payload.find({
    collection: 'media',
    where: {
      or: [{ filename: { equals: name } }, { filename: { like: `${stem}%` } }, { alt: { equals: alt } }],
    },
    limit: 1,
    depth: 0,
  })
  if (existing.docs[0]) return existing.docs[0]

  try {
    return await createPublicFile(payload, relativePath, alt)
  } catch {
    const fallback = await payload.find({
      collection: 'media',
      where: {
        or: [{ filename: { equals: name } }, { filename: { like: `${stem}%` } }, { alt: { equals: alt } }],
      },
      limit: 1,
      depth: 0,
    })
    if (fallback.docs[0]) return fallback.docs[0]
    throw new Error(`Unable to upload or reuse media for ${relativePath}`)
  }
}

export async function seedPodcastListing(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'podcast-listing' })
  const needsSubscribe = !current.subscribe?.length
  const needsCategories = !current.categories?.length

  const subscribeSources = [
    { name: 'Spotify', href: 'https://open.spotify.com', logoSrc: 'podcast/episode/subscribe-1.png', width: 119, height: 36 },
    { name: 'Apple Podcasts', href: 'https://podcasts.apple.com', logoSrc: 'podcast/episode/subscribe-2.png', width: 180, height: 36 },
    { name: 'RSS', href: '/podcast', logoSrc: 'podcast/episode/subscribe-3.png', width: 162, height: 36 },
    {
      name: 'YouTube',
      href: 'https://www.youtube.com',
      logoSrc: 'podcast/episode/subscribe-1.png',
      width: 86,
      height: 36,
    },
  ]

  let subscribe = current.subscribe
  if (needsSubscribe) {
    subscribe = await Promise.all(
      subscribeSources.map(async (platform) => {
        const logo = await findOrUploadPublicFile(payload, platform.logoSrc, platform.name)
        return {
          name: platform.name,
          href: platform.href,
          logo: logo.id,
          width: platform.width,
          height: platform.height,
        }
      }),
    )
  }

  if (!current.title || needsCategories || needsSubscribe || !current.description) {
    await payload.updateGlobal({
      slug: 'podcast-listing',
      data: {
        ...listingSeed,
        title: current.title || listingSeed.title,
        description: current.description || listingSeed.description,
        categories: needsCategories ? listingSeed.categories : current.categories,
        subscribe,
      },
    })
  }

  const episodes = await payload.find({
    collection: 'podcast-episodes',
    limit: 100,
    depth: 0,
  })

  for (const episode of episodes.docs) {
    const slug = episode.slug
    if (!slug) continue
    const meta = episodeMeta[slug] ?? {
      category: 'Digital engineering',
      excerpt: episode.about || episode.title || '',
      stats: '48K plays · 2 weeks ago',
    }
    const channelId = await ensurePodcastChannel(payload, meta.category)
    await payload.update({
      collection: 'podcast-episodes',
      id: episode.id,
      data: {
        ...(meta.title ? { title: meta.title } : {}),
        channel: channelId,
        category: meta.category,
        excerpt: meta.excerpt,
        stats: meta.stats,
        heroFeatured: Boolean(meta.heroFeatured),
        ...(meta.summary ? { summary: meta.summary } : {}),
        ...(meta.mainPoints?.length ? { mainPoints: meta.mainPoints } : {}),
      },
    })
  }
}
