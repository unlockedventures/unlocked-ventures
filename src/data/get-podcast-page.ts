import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { PodcastPageContent } from '@/components/site/podcast/podcast-page'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export async function getPodcastPage(): Promise<PodcastPageContent | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({ slug: 'podcast-page', depth: 1 })

  if (
    !doc.breadcrumbHomeLabel ||
    !doc.breadcrumbHomeHref ||
    !doc.breadcrumbPodcastLabel ||
    !doc.breadcrumbPodcastHref ||
    !doc.category ||
    !doc.title ||
    !doc.meta ||
    !doc.description ||
    !doc.coverAlt ||
    !doc.timeLabel ||
    doc.progress == null ||
    !doc.shareLabel ||
    !doc.saveLabel ||
    !doc.likeLabel ||
    !doc.transcriptLabel ||
    !doc.transcriptDialogTitle ||
    !doc.closeTranscriptLabel ||
    !doc.aboutTitle ||
    !doc.mainPointsTitle ||
    !doc.stanceTitle ||
    !doc.agreeTitle ||
    !doc.disagreeTitle ||
    !doc.takeTitle ||
    !doc.loadMoreLabel ||
    !doc.chaptersTitle ||
    !doc.listenNextTitle ||
    !doc.allEpisodesLabel ||
    !doc.allEpisodesHref ||
    !doc.subscribeTitle
  ) {
    return null
  }

  const coverSrc = mediaUrl(doc.cover)
  if (!coverSrc) return null

  const points = (items: { title?: string | null; body?: string | null }[] | null | undefined) =>
    (items ?? []).flatMap((item) => (item.title && item.body ? [{ title: item.title, body: item.body }] : []))
  const transcript = (doc.transcript ?? []).flatMap((line) =>
    line.time && line.speaker && line.text ? [{ time: line.time, speaker: line.speaker, text: line.text }] : [],
  )
  const chapters = (doc.chapters ?? []).flatMap((chapter) =>
    chapter.time && chapter.title ? [{ time: chapter.time, title: chapter.title }] : [],
  )
  const listenNext = (doc.listenNext ?? []).flatMap((item) => {
    const imageSrc = mediaUrl(item.image)
    if (!item.meta || !item.title || !item.href || !imageSrc) return []
    return [{ meta: item.meta, title: item.title, href: item.href, imageSrc }]
  })
  const subscribe = (doc.subscribe ?? []).flatMap((platform) => {
    const logoSrc = mediaUrl(platform.logo)
    if (!platform.name || !platform.href || !logoSrc || platform.width == null || platform.height == null) return []
    return [{ name: platform.name, href: platform.href, logoSrc, width: platform.width, height: platform.height }]
  })

  if (!chapters.length || !listenNext.length || !subscribe.length) return null

  return {
    breadcrumbHomeLabel: doc.breadcrumbHomeLabel,
    breadcrumbHomeHref: doc.breadcrumbHomeHref,
    breadcrumbPodcastLabel: doc.breadcrumbPodcastLabel,
    breadcrumbPodcastHref: doc.breadcrumbPodcastHref,
    category: doc.category,
    title: doc.title,
    meta: doc.meta,
    description: doc.description,
    metaTitle: doc.metaTitle || undefined,
    metaDescription: doc.metaDescription || undefined,
    coverSrc,
    coverAlt: doc.coverAlt,
    timeLabel: doc.timeLabel,
    progress: doc.progress,
    shareLabel: doc.shareLabel,
    saveLabel: doc.saveLabel,
    likeLabel: doc.likeLabel,
    transcriptLabel: doc.transcriptLabel,
    transcriptDialogTitle: doc.transcriptDialogTitle,
    closeTranscriptLabel: doc.closeTranscriptLabel,
    aboutTitle: doc.aboutTitle,
    mainPointsTitle: doc.mainPointsTitle,
    stanceTitle: doc.stanceTitle,
    agreeTitle: doc.agreeTitle,
    disagreeTitle: doc.disagreeTitle,
    takeTitle: doc.takeTitle,
    loadMoreLabel: doc.loadMoreLabel,
    about: doc.about || '',
    reading: doc.reading || '',
    agree: points(doc.agree),
    disagree: points(doc.disagree),
    takeIntro: doc.takeIntro || '',
    take: points(doc.take),
    transcript,
    chaptersTitle: doc.chaptersTitle,
    chapters,
    listenNextTitle: doc.listenNextTitle,
    listenNext,
    allEpisodesLabel: doc.allEpisodesLabel,
    allEpisodesHref: doc.allEpisodesHref,
    subscribeTitle: doc.subscribeTitle,
    subscribe,
  }
}
