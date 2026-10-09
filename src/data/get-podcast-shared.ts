import configPromise from '@payload-config'
import { getPayload } from 'payload'

export type PodcastSharedChrome = {
  breadcrumbHomeLabel: string
  breadcrumbHomeHref: string
  breadcrumbPodcastLabel: string
  breadcrumbPodcastHref: string
  shareLabel: string
  saveLabel: string
  likeLabel: string
  transcriptLabel: string
  transcriptDialogTitle: string
  closeTranscriptLabel: string
  aboutTitle: string
  mainPointsTitle: string
  stanceTitle: string
  agreeTitle: string
  disagreeTitle: string
  takeTitle: string
  loadMoreLabel: string
  listenNextTitle: string
  allEpisodesLabel: string
  allEpisodesHref: string
  subscribeTitle: string
  subscribe: { name: string; href: string; logoSrc: string; width: number; height: number }[]
}

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

/** Shared chrome for /podcast/[slug] — does not require legacy demo episode fields. */
export async function getPodcastSharedChrome(): Promise<PodcastSharedChrome | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({ slug: 'podcast-page', depth: 1 })

  if (
    !doc.breadcrumbHomeLabel ||
    !doc.breadcrumbHomeHref ||
    !doc.breadcrumbPodcastLabel ||
    !doc.breadcrumbPodcastHref ||
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
    !doc.listenNextTitle ||
    !doc.allEpisodesLabel ||
    !doc.allEpisodesHref ||
    !doc.subscribeTitle
  ) {
    return null
  }

  const subscribe = (doc.subscribe ?? []).flatMap((platform) => {
    const logoSrc = mediaUrl(platform.logo)
    if (!platform.name || !platform.href || !logoSrc || platform.width == null || platform.height == null) {
      return []
    }
    return [{ name: platform.name, href: platform.href, logoSrc, width: platform.width, height: platform.height }]
  })

  return {
    breadcrumbHomeLabel: doc.breadcrumbHomeLabel,
    breadcrumbHomeHref: doc.breadcrumbHomeHref,
    breadcrumbPodcastLabel: doc.breadcrumbPodcastLabel,
    breadcrumbPodcastHref: doc.breadcrumbPodcastHref,
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
    listenNextTitle: doc.listenNextTitle,
    allEpisodesLabel: doc.allEpisodesLabel,
    allEpisodesHref: doc.allEpisodesHref,
    subscribeTitle: doc.subscribeTitle,
    subscribe,
  }
}
