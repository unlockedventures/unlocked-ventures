import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

import { ContactPageView } from '@/components/site/views/contact-page-view'
import { getContact } from '@/data/get-contact'
import { getQueryClient } from '@/lib/query/get-query-client'
import { prefetchSiteResources } from '@/lib/query/prefetch'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const contact = await getContact()

  return {
    title: contact?.metaTitle,
    description: contact?.metaDescription,
  }
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
