import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { CaseStudiesListingCopy } from '@/components/site/success-stories/case-studies-listing'

export async function getOurSuccesses(): Promise<CaseStudiesListingCopy | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({ slug: 'our-successes' })

  if (
    !doc.metaTitle ||
    !doc.homeLabel ||
    !doc.homeHref ||
    !doc.currentLabel ||
    !doc.title ||
    !doc.description ||
    !doc.categoryPrefix ||
    !doc.allLabel ||
    !doc.emptyLabel ||
    !doc.seeMoreLabel
  ) {
    return null
  }

  return {
    metaTitle: doc.metaTitle,
    homeLabel: doc.homeLabel,
    homeHref: doc.homeHref,
    currentLabel: doc.currentLabel,
    title: doc.title,
    description: doc.description,
    categoryPrefix: doc.categoryPrefix,
    allLabel: doc.allLabel,
    emptyLabel: doc.emptyLabel,
    seeMoreLabel: doc.seeMoreLabel,
  }
}
