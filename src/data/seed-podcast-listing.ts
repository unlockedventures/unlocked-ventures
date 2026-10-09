import path from 'path'
import type { Payload } from 'payload'

import { uploadPublicFile as createPublicFile } from '@/data/upload-public-file'

const listingSeed = {
  metaTitle: 'Podcast',
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
  seeMoreLabel: 'See more',
  emptyLabel: 'No episodes yet.',
  subscribeTitle: 'Subscribe to Future of Work',
  subscribeDescription: 'New episodes every Wednesday, about 25 minutes each.',
}

const episodeMeta: Record<
  string,
  { category: string; excerpt: string; stats: string; heroFeatured?: boolean; title?: string }
> = {
  'how-tech-will-and-wont-replace-your-doctor': {
    category: 'Digital engineering',
    excerpt:
      'Since 2019, over a thousand warehouse campuses have popped up around the world. Each complex covers nearly 100,000 square meters — facilities for running and training Large Language Models.',
    stats: '135K plays · 12 days ago',
    heroFeatured: true,
  },
  'the-future-of-ai-in-mental-health-care': {
    category: 'Future',
    excerpt: 'How AI tools are reshaping mental health care without replacing clinical judgment.',
    stats: '98K plays · 3 weeks ago',
  },
  'wearable-tech-revolutionizing-fitness-tracking': {
    category: 'Communication',
    excerpt: 'What fitness wearables get right, and what still fails when care teams need the data.',
    stats: '76K plays · 1 month ago',
  },
  'how-clinics-can-use-ai-without-losing-the-patient': {
    category: 'Artificial intelligence (AI)',
    excerpt: 'Practical ways clinics can adopt AI while keeping patients at the center of care.',
    stats: '112K plays · 5 days ago',
  },
  'what-wearable-data-is-still-missing-in-care': {
    category: 'Digital engineering',
    excerpt: 'The gaps between consumer wearables and clinical workflows that still need closing.',
    stats: '64K plays · 2 weeks ago',
  },
  'a-clearer-way-to-talk-about-clinical-risk': {
    category: 'Communication',
    excerpt: 'How teams can talk about clinical risk without drowning stakeholders in jargon.',
    stats: '51K plays · 8 days ago',
  },
  'hohow-to-make-stress-your-friend': {
    category: 'Future',
    excerpt: 'Reframing stress as a signal teams can use when shipping under pressure.',
    stats: '41K plays · 4 days ago',
    title: 'How to Make Stress Your Friend',
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
    await payload.update({
      collection: 'podcast-episodes',
      id: episode.id,
      data: {
        ...(meta.title ? { title: meta.title } : {}),
        category: meta.category,
        excerpt: meta.excerpt,
        stats: meta.stats,
        heroFeatured: Boolean(meta.heroFeatured),
      },
    })
  }
}
