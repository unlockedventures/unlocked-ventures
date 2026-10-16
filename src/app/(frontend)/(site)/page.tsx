import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { HomePageView } from '@/components/site/views/home-page-view'
import { getSite } from '@/data/get-site'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()
  const title = site?.title || 'Unlocked Ventures'
  return {
    ...buildPageMetadata({
      title,
      description: site?.description,
      path: '/',
      tags: ['home', 'private equity', 'CFO', 'AI', 'digital transformation'],
    }),
    // Avoid "Site | Site" from the root title template on the homepage.
    title: { absolute: title },
  }
}

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
