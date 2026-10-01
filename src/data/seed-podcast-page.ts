import type { Payload } from 'payload'

import { podcastPage } from '@/data/podcast-page'
import { uploadPublicFile } from '@/data/upload-public-file'

export async function seedPodcastPage(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'podcast-page' })
  if (current.title) return

  const cover = await uploadPublicFile(payload, podcastPage.episode.coverSrc, podcastPage.episode.coverAlt)
  const listenNext = await Promise.all(
    podcastPage.listenNext.map(async (item) => {
      const image = await uploadPublicFile(payload, item.imageSrc, item.title)
      return { meta: item.meta, title: item.title, href: item.href, image: image.id }
    }),
  )
  const subscribe = await Promise.all(
    podcastPage.subscribe.map(async (platform) => {
      const logo = await uploadPublicFile(payload, platform.logoSrc, platform.name)
      return {
        name: platform.name,
        href: platform.href,
        logo: logo.id,
        width: platform.width,
        height: platform.height,
      }
    }),
  )

  await payload.updateGlobal({
    slug: 'podcast-page',
    data: {
      breadcrumbHomeLabel: podcastPage.breadcrumb.home.label,
      breadcrumbHomeHref: podcastPage.breadcrumb.home.href,
      breadcrumbPodcastLabel: podcastPage.breadcrumb.podcast.label,
      breadcrumbPodcastHref: podcastPage.breadcrumb.podcast.href,
      category: podcastPage.episode.category,
      title: podcastPage.episode.title,
      meta: podcastPage.episode.meta,
      description: podcastPage.episode.description,
      cover: cover.id,
      coverAlt: podcastPage.episode.coverAlt,
      timeLabel: podcastPage.episode.timeLabel,
      progress: podcastPage.episode.progress,
      shareLabel: 'Share',
      saveLabel: 'Save',
      likeLabel: 'Like',
      transcriptLabel: 'Read transcript',
      chaptersTitle: 'Chapters',
      chapters: podcastPage.chapters,
      listenNextTitle: 'Listen next',
      listenNext,
      allEpisodesLabel: podcastPage.allEpisodes.label,
      allEpisodesHref: podcastPage.allEpisodes.href,
      subscribeTitle: 'Subscribe on',
      subscribe,
    },
  })
}
