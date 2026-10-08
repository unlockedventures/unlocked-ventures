'use client'

import { PodcastPage } from '@/components/site/podcast/podcast-page'
import { usePodcastPage } from '@/hooks/queries/use-site-queries'

export function PodcastPageView() {
  const podcast = usePodcastPage()
  if (!podcast.data) return null
  return <PodcastPage content={podcast.data} />
}
