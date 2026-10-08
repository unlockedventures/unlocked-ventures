import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { HomePageView } from '@/components/site/views/home-page-view'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const queryClient = getQueryClient()
  await prefetchSiteResources(queryClient, [
    'hero',
    'trusted-by',
    'strategic-advisory',
    'digital-engineering',
    'success-stories',
    'awards',
    'awards-section',
    'recent-podcast',
    'latest-news',
    'locations',
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePageView />
    </HydrationBoundary>
  )
}
