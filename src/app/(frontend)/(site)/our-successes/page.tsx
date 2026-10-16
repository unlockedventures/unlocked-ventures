import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { OurSuccessesPageView } from '@/components/site/views/our-successes-page-view'
import { getOurSuccesses } from '@/data/get-our-successes'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const page = await getOurSuccesses()
  return buildPageMetadata({
    title: page?.metaTitle || 'Our Successes',
    description: page?.description,
    path: '/our-successes',
    tags: ['success stories', 'case studies', 'portfolio', 'outcomes'],
  })
}

export default async function OurSuccessesPage() {
  const queryClient = getQueryClient()
  await prefetchSiteResources(queryClient, ['our-successes', 'case-studies'])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OurSuccessesPageView />
    </HydrationBoundary>
  )
}
