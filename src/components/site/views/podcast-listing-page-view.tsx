'use client'

import { PodcastListing } from '@/components/site/podcast/podcast-listing'
import { usePodcastListing } from '@/hooks/queries/use-site-queries'

export function PodcastListingPageView() {
  const page = usePodcastListing()
  if (!page.data) return null

  return (
    <section className="relative isolate overflow-hidden bg-white" aria-label={page.data.title}>
      <PodcastListing copy={page.data} />
    </section>
  )
}
