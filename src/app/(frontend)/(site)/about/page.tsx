import type { Metadata } from 'next'

import { AboutDelivered } from '@/components/site/about/about-delivered'
import { AboutFounder } from '@/components/site/about/about-founder'
import { AboutHero } from '@/components/site/about/about-hero'
import { AboutHowWeWork } from '@/components/site/about/about-how-we-work'
import { AboutLogoWall } from '@/components/site/about/about-logo-wall'
import { getAbout } from '@/data/get-about'
import { getLocations } from '@/data/get-locations'
import { LocationsSection } from '@/components/site/locations/locations-section'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAbout()
  return {
    title: about?.metaTitle,
    description: about?.metaDescription,
  }
}

export default async function AboutPage() {
  const [about, locations] = await Promise.all([getAbout(), getLocations()])
  if (!about) return null

  return (
    <div className="bg-white">
      <AboutHero content={about} />
      <AboutLogoWall title={about.logoTitle} logos={about.logos} />
      <AboutDelivered title={about.deliveredTitle} stats={about.stats} />
      <AboutFounder content={about} />
      <AboutHowWeWork title={about.howWeWorkTitle} principles={about.principles} />
      {locations ? <LocationsSection {...locations} /> : null}
    </div>
  )
}
