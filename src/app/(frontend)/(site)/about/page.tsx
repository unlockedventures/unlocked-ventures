import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { AboutPageView } from '@/components/site/views/about-page-view'
import { getAbout } from '@/data/get-about'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout()
  return buildPageMetadata({
    title: about?.metaTitle || 'About',
    description: about?.metaDescription,
    path: '/about',
    tags: ['about', 'company', 'team', 'awards', 'culture'],
  })
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
