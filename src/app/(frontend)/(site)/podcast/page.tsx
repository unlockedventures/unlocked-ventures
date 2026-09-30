import type { Metadata } from 'next'

import { PodcastPage } from '@/components/site/podcast/podcast-page'
import { podcastPage } from '@/data/podcast-page'

export const metadata: Metadata = {
  title: podcastPage.episode.title,
  description: podcastPage.episode.description,
}

export default function Page() {
  return <PodcastPage />
}
