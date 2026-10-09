import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { InsightsPageView } from '@/components/site/views/insights-page-view'
import { getInsights } from '@/data/get-insights'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getInsights()
  return {
    title: page?.metaTitle,
    description: page?.description,
  }
}

export default async function InsightsPage() {
  const queryClient = getQueryClient()
  await prefetchSiteResources(queryClient, ['insights', 'news-posts'])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <InsightsPageView />
    </HydrationBoundary>
  )
}
