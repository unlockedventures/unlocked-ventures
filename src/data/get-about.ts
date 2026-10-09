import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { AboutContent } from '@/components/site/about/about-content'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export async function getAbout(): Promise<AboutContent | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({ slug: 'about', depth: 1 })

  if (
    !doc.metaTitle ||
    !doc.metaDescription ||
    !doc.breadcrumbHomeLabel ||
    !doc.breadcrumbHomeHref ||
    !doc.breadcrumbCurrent ||
    !doc.title ||
    !doc.description ||
    !doc.badgeAlt ||
    !doc.heroImageAlt ||
    !doc.logoTitle ||
    !doc.deliveredTitle ||
    !doc.founderRole ||
    !doc.founderTitle ||
    !doc.founderSummary ||
    !doc.founderBio ||
    !doc.founderImageAlt ||
    !doc.founderCtaLabel ||
    !doc.founderCtaHref ||
    !doc.howWeWorkTitle
  ) {
    return null
  }

  const logos = (doc.logos ?? []).flatMap((logo) => {
    const src = mediaUrl(logo.image)
    if (!logo.name || !src || logo.displayWidth == null || logo.displayHeight == null) return []
    return [{ name: logo.name, src, width: logo.displayWidth, height: logo.displayHeight }]
  })
  const stats = (doc.stats ?? []).flatMap((stat) =>
    stat.value && stat.label ? [{ value: stat.value, label: stat.label }] : [],
  )
  const principles = (doc.principles ?? []).flatMap((item) => {
    const iconSrc = mediaUrl(item.icon)
    if (!item.title || !item.body || !iconSrc || item.iconWidth == null || item.iconHeight == null) return []
    return [{ title: item.title, body: item.body, iconSrc, width: item.iconWidth, height: item.iconHeight }]
  })
  const experienceRoles = (doc.experienceRoles ?? []).flatMap((item) => {
    if (!item.role || !item.company || !item.dateLabel) return []
    const highlights = (item.highlights ?? []).flatMap((row) => (row.text ? [row.text] : []))
    return [
      {
        role: item.role,
        company: item.company,
        dateLabel: item.dateLabel,
        summary: item.summary || undefined,
        highlights,
        defaultOpen: Boolean(item.defaultOpen),
      },
    ]
  })

  if (!logos.length || !stats.length || !principles.length) return null

  return {
    metaTitle: doc.metaTitle,
    metaDescription: doc.metaDescription,
    breadcrumbHomeLabel: doc.breadcrumbHomeLabel,
    breadcrumbHomeHref: doc.breadcrumbHomeHref,
    breadcrumbCurrent: doc.breadcrumbCurrent,
    title: doc.title,
    description: doc.description,
    badgeSrc: mediaUrl(doc.badgeImage),
    badgeAlt: doc.badgeAlt,
    heroSrc: mediaUrl(doc.heroImage),
    heroAlt: doc.heroImageAlt,
    logoTitle: doc.logoTitle,
    logos,
    deliveredTitle: doc.deliveredTitle,
    stats,
    founderRole: doc.founderRole,
    founderTitle: doc.founderTitle,
    founderSummary: doc.founderSummary,
    founderBio: doc.founderBio,
    founderImageSrc: mediaUrl(doc.founderImage),
    founderImageAlt: doc.founderImageAlt,
    founderCtaLabel: doc.founderCtaLabel,
    founderCtaHref: doc.founderCtaHref,
    experienceTitle: doc.experienceTitle || 'Experience',
    experienceRoles,
    howWeWorkTitle: doc.howWeWorkTitle,
    principles,
  }
}
