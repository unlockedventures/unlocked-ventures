import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { PodcastPageContent } from '@/components/site/podcast/podcast-page'
import { getPodcastSharedChrome } from '@/data/get-podcast-shared'
import { podcastEpisodePath, podcastSlugFromHref, slugifyPodcastTitle } from '@/lib/podcast-slug'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

function episodeSlug(episode: { slug?: string | null; href?: string | null; title?: string | null }) {
  if (episode.slug?.trim()) return episode.slug.trim()
  if (episode.href) {
    const fromHref = podcastSlugFromHref(episode.href)
    if (fromHref) return fromHref
  }
  if (episode.title) return slugifyPodcastTitle(episode.title)
  return null
}

export { podcastSlugFromHref }

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
    getPodcastSharedChrome(),
  ])

  if (!shared) return null

  const episodes = result.docs.flatMap((episode) => {
    if (!episode.title) return []
    const resolvedSlug = episodeSlug(episode)
    if (!resolvedSlug) return []
    return [{ episode, episodeSlug: resolvedSlug }]
  })

  const match = episodes.find((item) => item.episodeSlug === slug)
  if (!match) return null

  const { episode } = match
  const coverSrc = mediaUrl(episode.image) || ''

  const points = (items: { title?: string | null; body?: string | null }[] | null | undefined) =>
    (items ?? []).flatMap((item) => (item.title && item.body ? [{ title: item.title, body: item.body }] : []))
  const mainPoints = (episode.mainPoints ?? []).flatMap((item) => {
    const point = typeof item?.point === 'string' ? item.point.trim() : ''
    return point ? [point] : []
  })
  const transcript = (episode.transcript ?? []).flatMap((line) =>
    line.time && line.speaker && line.text ? [{ time: line.time, speaker: line.speaker, text: line.text }] : [],
  )
  const summary = typeof episode.summary === 'string' ? episode.summary.trim() : ''
  const about = typeof episode.about === 'string' ? episode.about.trim() : ''

  const listenNext = episodes.flatMap(({ episode: item, episodeSlug: itemSlug }) => {
    if (itemSlug === slug) return []
    if (!item.meta || !item.title) return []
    return [
      {
        meta: item.guests ? `${item.meta} · ${item.guests}` : item.meta,
        title: item.title,
        href: podcastEpisodePath(itemSlug),
        imageSrc: mediaUrl(item.image) || '',
      },
    ]
  })

  return {
    breadcrumbHomeLabel: shared.breadcrumbHomeLabel,
    breadcrumbHomeHref: shared.breadcrumbHomeHref,
    breadcrumbPodcastLabel: shared.breadcrumbPodcastLabel,
    breadcrumbPodcastHref: shared.breadcrumbPodcastHref,
    category: episode.category || '',
    title: episode.title,
    meta: [episode.meta, episode.guests].filter(Boolean).join(' · '),
    description: summary || about || '',
    coverSrc,
    coverAlt: episode.imageAlt || episode.title,
    mediaUrl: episode.mediaUrl || '',
    timeLabel: episode.meta || '',
    about,
    summary,
    mainPoints,
    reading: episode.reading || '',
    agree: points(episode.agree),
    disagree: points(episode.disagree),
    takeIntro: episode.takeIntro || '',
    take: points(episode.take),
    transcript,
    progress: 0,
    shareLabel: shared.shareLabel,
    saveLabel: shared.saveLabel,
    likeLabel: shared.likeLabel,
    transcriptLabel: shared.transcriptLabel,
    transcriptDialogTitle: shared.transcriptDialogTitle,
    closeTranscriptLabel: shared.closeTranscriptLabel,
    aboutTitle: shared.aboutTitle,
    mainPointsTitle: shared.mainPointsTitle,
    stanceTitle: shared.stanceTitle,
    agreeTitle: shared.agreeTitle,
    disagreeTitle: shared.disagreeTitle,
    takeTitle: shared.takeTitle,
    loadMoreLabel: shared.loadMoreLabel,
    chaptersTitle: '',
    chapters: [],
    listenNextTitle: shared.listenNextTitle,
    listenNext,
    allEpisodesLabel: shared.allEpisodesLabel,
    allEpisodesHref: shared.allEpisodesHref,
    subscribeTitle: shared.subscribeTitle,
    subscribe: shared.subscribe,
  }
}
