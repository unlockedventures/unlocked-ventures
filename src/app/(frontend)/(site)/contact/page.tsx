import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { ContactPageView } from '@/components/site/views/contact-page-view'
import { getContact } from '@/data/get-contact'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContact()

  return buildPageMetadata({
    title: contact?.metaTitle || 'Contact',
    description: contact?.metaDescription,
    path: '/contact',
    tags: ['contact', 'get in touch', 'inquiry', 'support'],
  })
}

export default async function ContactPage() {
  const queryClient = getQueryClient()
  await prefetchSiteResources(queryClient, ['contact', 'locations'])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ContactPageView />
    </HydrationBoundary>
  )
}
