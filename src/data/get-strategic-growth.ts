import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { EngagementSectionProps } from '@/components/site/solutions/engagement-section'
import type { HowWeWorkSectionProps } from '@/components/site/solutions/how-we-work-section'
import type { ServiceIntroSectionProps } from '@/components/site/solutions/intro-section'
import type { RelatedSolutionsSectionProps } from '@/components/site/solutions/related-solutions-section'
import type { TryingToBuildSectionProps } from '@/components/site/solutions/trying-to-build-section'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export type StrategicGrowthContent = {
  current: string
  description: string
  intro: ServiceIntroSectionProps
  engagement: EngagementSectionProps
  howWeWork: HowWeWorkSectionProps
  cta: TryingToBuildSectionProps
  related: RelatedSolutionsSectionProps
}

export async function getStrategicGrowth(): Promise<StrategicGrowthContent | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({
    slug: 'strategic-growth',
    depth: 1,
  })

  if (
    !doc.title ||
    !doc.description ||
    !doc.current ||
    !doc.engagementTitle ||
    !doc.howWeWorkTitle ||
    !doc.ctaTitle ||
    !doc.ctaDescription ||
    !doc.cta?.label ||
    !doc.cta.href ||
    !doc.relatedTitle
  ) {
    return null
  }

  const breadcrumbs = (doc.breadcrumbs ?? []).flatMap((crumb) => {
    if (!crumb.label || !crumb.href) return []
    return [{ label: crumb.label, href: crumb.href }]
  })

  const engagementItems = (doc.engagementItems ?? []).flatMap((item) => {
    if (!item.number || !item.title || !item.body) return []
    return [{ number: item.number, title: item.title, body: item.body }]
  })

  const steps = (doc.steps ?? []).flatMap((step) => {
    if (!step.number || !step.title || !step.body) return []
    return [{ number: step.number, title: step.title, body: step.body }]
  })

  const solutions = (doc.related ?? []).flatMap((solution) => {
    if (!solution.title || !solution.href || !solution.body || !solution.iconWidth || !solution.iconHeight) {
      return []
    }

    return [
      {
        title: solution.title,
        href: solution.href,
        body: solution.body,
        iconSrc: mediaUrl(solution.icon),
        iconWidth: solution.iconWidth,
        iconHeight: solution.iconHeight,
      },
    ]
  })

  if (!breadcrumbs.length || !engagementItems.length || !steps.length || !solutions.length) return null

  return {
    current: doc.current,
    description: doc.description,
    intro: {
      breadcrumbs,
      current: doc.current,
      title: doc.title,
      description: doc.description,
      illustrationSrc: mediaUrl(doc.illustration),
      imageSrc: mediaUrl(doc.heroImage),
      imageAlt: doc.heroImageAlt || '',
    },
    engagement: {
      title: doc.engagementTitle,
      items: engagementItems,
    },
    howWeWork: {
      title: doc.howWeWorkTitle,
      steps,
    },
    cta: {
      title: doc.ctaTitle,
      description: doc.ctaDescription,
      cta: {
        label: doc.cta.label,
        href: doc.cta.href,
      },
    },
    related: {
      title: doc.relatedTitle,
      solutions,
    },
  }
}
