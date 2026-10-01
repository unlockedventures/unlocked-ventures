import type { Metadata } from 'next'

import { PodcastPage } from '@/components/site/podcast/podcast-page'
import { getPodcastPage } from '@/data/get-podcast-page'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPodcastPage()
  return {
    title: content?.title,
    description: content?.description,
  }
}

export default async function Page() {
  const content = await getPodcastPage()
  if (!content) return null
  return <PodcastPage content={content} />
}
