'use client'

import { EngagementSection } from '@/components/site/solutions/engagement-section'
import { HowWeWorkSection } from '@/components/site/solutions/how-we-work-section'
import { ServiceIntroSection } from '@/components/site/solutions/intro-section'
import { RelatedSolutionsSection } from '@/components/site/solutions/related-solutions-section'
import { SolutionSidebar } from '@/components/site/solutions/solution-sidebar'
import { TryingToBuildSection } from '@/components/site/solutions/trying-to-build-section'
import { SuccessStoriesSection } from '@/components/site/success-stories/success-stories-section'
import { useNavigation, useSolution, useSuccessStories } from '@/hooks/queries/use-site-queries'

const SIDEBAR_LABELS = ['Strategic Advisory', 'Digital Engineering'] as const

export function SolutionPageView({ slug }: { slug: string }) {
  const page = useSolution(slug)
  const successStories = useSuccessStories()
  const navigation = useNavigation()
  const content = page.data

  if (!content) return null

  const activeHref = `/solutions/${content.slug}`
  const navItems = navigation.data?.items ?? []
  const sidebarSections = SIDEBAR_LABELS.flatMap((label) => {
    const item = navItems.find((navItem) => navItem.label === label)
    return item ? [{ label: item.label, groups: item.groups }] : []
  })

  return (
    <div className="bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 pt-8 pb-0 sm:px-6 md:gap-12 md:px-8 md:pt-10 xl:flex-row xl:items-start xl:gap-12 xl:px-14 xl:pt-16">
        {sidebarSections.length ? (
          <aside className="w-full shrink-0 xl:sticky xl:top-24 xl:max-h-[calc(100dvh-6.5rem)] xl:w-[340px] xl:self-start">
            <SolutionSidebar sections={sidebarSections} activeHref={activeHref} />
          </aside>
        ) : null}

        <div className="min-w-0 flex-1">
          <ServiceIntroSection {...content.intro} />
          <EngagementSection {...content.engagement} />
          <HowWeWorkSection {...content.howWeWork} />
          {successStories.data ? (
            <SuccessStoriesSection
              {...successStories.data}
              className="[&>div]:max-w-none [&>div]:px-0"
            />
          ) : null}
          <TryingToBuildSection {...content.cta} />
          <RelatedSolutionsSection {...content.related} />
        </div>
      </div>
    </div>
  )
}
