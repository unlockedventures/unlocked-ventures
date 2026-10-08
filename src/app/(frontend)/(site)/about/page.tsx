import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { AboutPageView } from '@/components/site/views/about-page-view'
import { getAbout } from '@/data/get-about'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout()
  return {
    title: about?.metaTitle,
    description: about?.metaDescription,
  }
}

export default async function AboutPage() {
  const queryClient = getQueryClient()
  await prefetchSiteResources(queryClient, ['about', 'locations'])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AboutPageView />
    </HydrationBoundary>
  )
}
