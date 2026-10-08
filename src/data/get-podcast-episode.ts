import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { PodcastPageContent } from '@/components/site/podcast/podcast-page'
import { getPodcastPage } from '@/data/get-podcast-page'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export function podcastSlugFromHref(href: string) {
  const path = href.split('?')[0]?.split('#')[0]?.replace(/\/+$/, '') ?? ''
  const parts = path.split('/').filter(Boolean)
  if (parts[0] !== 'podcast' || !parts[1]) return null
  try {
    return decodeURIComponent(parts[1])
  } catch {
    return parts[1]
  }
}

export async function getPodcastEpisode(slug: string): Promise<PodcastPageContent | null> {
  const payload = await getPayload({ config: configPromise })
  const [result, shared] = await Promise.all([
    payload.find({
      collection: 'podcast-episodes',
      depth: 1,
      limit: 100,
      pagination: false,
      sort: 'sortOrder',
    }),
    getPodcastPage(),
  ])

  const episodes = result.docs.flatMap((episode) => {
    if (!episode.title || !episode.href) return []
    const episodeSlug = podcastSlugFromHref(episode.href)
    if (!episodeSlug) return []
    return [{ episode, episodeSlug }]
  })

  const match = episodes.find((item) => item.episodeSlug === slug)
  if (!match) return null

  const { episode } = match
  const coverSrc = mediaUrl(episode.image)
  if (!coverSrc) return null

  const listenNext = episodes.flatMap(({ episode: item, episodeSlug }) => {
    if (episodeSlug === slug) return []
    const imageSrc = mediaUrl(item.image)
    if (!item.meta || !item.title || !item.href || !imageSrc) return []
    return [
      {
        meta: item.guests ? `${item.meta} · ${item.guests}` : item.meta,
        title: item.title,
        href: item.href,
        imageSrc,
      },
    ]
  })

  return {
    breadcrumbHomeLabel: 'Home',
    breadcrumbHomeHref: '/',
    breadcrumbPodcastLabel: 'Podcast',
    breadcrumbPodcastHref: '/podcast',
    category: '',
    title: episode.title,
    meta: [episode.meta, episode.guests].filter(Boolean).join(' · '),
    description: '',
    coverSrc,
    coverAlt: episode.imageAlt || episode.title,
    timeLabel: episode.meta || '',
    progress: 0,
    shareLabel: '',
    saveLabel: '',
    likeLabel: '',
    transcriptLabel: '',
    chaptersTitle: '',
    chapters: [],
    listenNextTitle: shared?.listenNextTitle || 'Listen next',
    listenNext,
    allEpisodesLabel: shared?.allEpisodesLabel || 'All episodes',
    allEpisodesHref: shared?.allEpisodesHref || '/podcast',
    subscribeTitle: shared?.subscribeTitle || '',
    subscribe: shared?.subscribe ?? [],
  }
}
