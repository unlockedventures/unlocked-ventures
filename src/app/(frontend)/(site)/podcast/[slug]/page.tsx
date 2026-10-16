import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PodcastPage } from '@/components/site/podcast/podcast-page'
import { getPodcastEpisode } from '@/data/get-podcast-episode'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const content = await getPodcastEpisode(slug)
  return buildPageMetadata({
    title: content?.metaTitle || content?.title || 'Podcast episode',
    description:
      content?.metaDescription || content?.description || content?.meta || content?.summary,
    path: `/podcast/${slug}`,
    image: content?.coverSrc,
    imageAlt: content?.coverAlt || content?.title,
    tags: ['podcast', 'episode', content?.category, content?.meta],
  })
}

export default async function PodcastEpisodePage({ params }: PageProps) {
  const { slug } = await params
  const content = await getPodcastEpisode(slug)
  if (!content) notFound()

  return <PodcastPage content={content} />
}
