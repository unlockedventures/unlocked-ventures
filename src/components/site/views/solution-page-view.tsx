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
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 pt-6 pb-0 sm:gap-8 sm:px-6 sm:pt-8 md:gap-10 md:px-8 md:pt-10 xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)] xl:items-start xl:gap-12 xl:px-14 xl:pt-16">
        {sidebarSections.length ? (
          <SolutionSidebar sections={sidebarSections} activeHref={activeHref} />
        ) : null}

        <div className="min-w-0">
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
