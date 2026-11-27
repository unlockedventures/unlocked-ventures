import type { Metadata } from 'next'

import { ErrorScreen } from '@/components/site/error-screen'
import { getSite } from '@/data/get-site'

async function loadSite() {
  try {
    return await getSite()
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSite()

  return {
    title: site?.notFoundMetaTitle || 'Page not found',
  }
}

export default async function NotFound() {
  const site = await loadSite()
  if (!site) {
    return (
      <ErrorScreen
        label="404"
        title="Page not found"
        description="The page you are looking for does not exist."
        homeLabel="Home"
      />
    )
  }

  return (
    <ErrorScreen
      label={site.notFoundLabel}
      title={site.notFoundTitle}
      description={site.notFoundDescription}
      homeLabel={site.homeButtonLabel}
    />
  )
}
