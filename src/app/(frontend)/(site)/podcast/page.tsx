import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { PodcastPageView } from '@/components/site/views/podcast-page-view'
import { getPodcastPage } from '@/data/get-podcast-page'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPodcastPage()
  return {
    title: content?.title,
    description: content?.description,
  }
}

export default async function Page() {
  const queryClient = getQueryClient()
  await prefetchSiteResources(queryClient, ['podcast-page'])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PodcastPageView />
    </HydrationBoundary>
  )
}
