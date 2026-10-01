import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { HeroSectionProps } from '@/components/site/hero/hero-section'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export async function getHero(): Promise<HeroSectionProps | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({
    slug: 'hero',
    depth: 1,
  })

  if (!doc.title || !doc.cta?.label || !doc.cta.href) return null

  const description = (doc.description ?? []).flatMap((paragraph) =>
    paragraph.text ? [paragraph.text] : [],
  )
  if (!description.length) return null

  const rotatingWords = (doc.rotatingWords ?? []).flatMap((word) => (word.text ? [word.text] : []))

  return {
    title: doc.title,
    rotatingWords,
    description,
    cta: {
      label: doc.cta.label,
      href: doc.cta.href,
    },
    media: {
      primarySrc: mediaUrl(doc.primaryImage),
      secondarySrc: mediaUrl(doc.secondaryImage),
      badgeSrc: mediaUrl(doc.badgeImage),
      badgeAlt: doc.badgeAlt || undefined,
    },
  }
}
