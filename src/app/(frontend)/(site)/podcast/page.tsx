import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { PodcastListingPageView } from '@/components/site/views/podcast-listing-page-view'
import { getPodcastListing } from '@/data/get-podcast-listing'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPodcastListing()
  return {
    title: content?.metaTitle,
    description: content?.description,
  }
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
