import configPromise from '@payload-config'
import { getPayload } from 'payload'

export type SiteContent = {
  title: string
  description: string
  notFoundMetaTitle: string
  notFoundLabel: string
  notFoundTitle: string
  notFoundDescription: string
  homeButtonLabel: string
}

export async function getSite(): Promise<SiteContent | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({ slug: 'site' })

  if (
    !doc.title ||
    !doc.description ||
    !doc.notFoundMetaTitle ||
    !doc.notFoundLabel ||
    !doc.notFoundTitle ||
    !doc.notFoundDescription ||
    !doc.homeButtonLabel
  ) {
    return null
  }

  return {
    title: doc.title,
    description: doc.description,
    notFoundMetaTitle: doc.notFoundMetaTitle,
    notFoundLabel: doc.notFoundLabel,
    notFoundTitle: doc.notFoundTitle,
    notFoundDescription: doc.notFoundDescription,
    homeButtonLabel: doc.homeButtonLabel,
  }
}
