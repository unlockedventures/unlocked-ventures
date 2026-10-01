'use server'

import { getSite } from '@/data/get-site'

export async function getErrorContent() {
  const site = await getSite()
  if (!site) return null

  return {
    metaTitle: site.errorMetaTitle,
    label: site.errorLabel,
    title: site.errorTitle,
    description: site.errorDescription,
    homeLabel: site.homeButtonLabel,
  }
}
