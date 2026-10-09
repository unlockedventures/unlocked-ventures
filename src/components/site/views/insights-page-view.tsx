'use client'

import { InsightsListing } from '@/components/site/insights/insights-listing'
import { useInsights, useNewsPosts } from '@/hooks/queries/use-site-queries'

export function InsightsPageView() {
  const page = useInsights()
  const posts = useNewsPosts()
  const copy = page.data

  if (!copy) return null

  return (
    <section className="relative isolate overflow-hidden bg-white" aria-label={copy.title}>
      <InsightsListing posts={posts.data ?? []} copy={copy} />
    </section>
  )
}
