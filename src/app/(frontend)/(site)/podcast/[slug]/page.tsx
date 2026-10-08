import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PodcastPage } from '@/components/site/podcast/podcast-page'
import { getPodcastEpisode } from '@/data/get-podcast-episode'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const content = await getPodcastEpisode(slug)
  return {
    title: content?.title,
    description: content?.meta,
  }
}

export default async function PodcastEpisodePage({ params }: PageProps) {
  const { slug } = await params
  const content = await getPodcastEpisode(slug)
  if (!content) notFound()

  return <PodcastPage content={content} />
}
