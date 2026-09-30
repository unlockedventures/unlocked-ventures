import type { Metadata } from 'next'

import { ErrorScreen } from '@/components/site/error-screen'
import { getSite } from '@/data/get-site'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()

  return {
    title: site?.notFoundMetaTitle,
  }
}

export default async function NotFound() {
  const site = await getSite()
  if (!site) return null

  return (
    <ErrorScreen
      label={site.notFoundLabel}
      title={site.notFoundTitle}
      description={site.notFoundDescription}
      homeLabel={site.homeButtonLabel}
    />
  )
}
