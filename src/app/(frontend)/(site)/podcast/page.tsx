import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { PodcastListingPageView } from '@/components/site/views/podcast-listing-page-view'
import { getPodcastListing } from '@/data/get-podcast-listing'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPodcastListing()
  return buildPageMetadata({
    title: content?.metaTitle || 'Podcast',
    description: content?.description,
    path: '/podcast',
    tags: ['podcast', 'episodes', 'healthcare', 'AI', 'technology'],
  })
}

export default async function Page() {
  const queryClient = getQueryClient()
  await prefetchSiteResources(queryClient, ['podcast-listing'])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PodcastListingPageView />
    </HydrationBoundary>
  )
}
