'use client'

import { AboutDelivered } from '@/components/site/about/about-delivered'
import { AboutFounder } from '@/components/site/about/about-founder'
import { AboutHero } from '@/components/site/about/about-hero'
import { AboutHowWeWork } from '@/components/site/about/about-how-we-work'
import { AboutLogoWall } from '@/components/site/about/about-logo-wall'
import { LocationsSection } from '@/components/site/locations/locations-section'
import { useAbout, useLocations } from '@/hooks/queries/use-site-queries'

export function AboutPageView() {
  const about = useAbout()
  const locations = useLocations()
  const content = about.data

  if (!content) return null

  return (
    <div className="bg-white">
      <AboutHero content={content} />
      <AboutLogoWall title={content.logoTitle} logos={content.logos} />
      <AboutDelivered title={content.deliveredTitle} stats={content.stats} />
      <AboutFounder content={content} />
      <AboutHowWeWork title={content.howWeWorkTitle} principles={content.principles} />
      {locations.data ? <LocationsSection {...locations.data} /> : null}
    </div>
  )
}
