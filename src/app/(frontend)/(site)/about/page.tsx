import type { Metadata } from 'next'

import { AboutDelivered } from '@/components/site/about/about-delivered'
import { AboutFounder } from '@/components/site/about/about-founder'
import { AboutHero } from '@/components/site/about/about-hero'
import { AboutHowWeWork } from '@/components/site/about/about-how-we-work'
import { AboutLogoWall } from '@/components/site/about/about-logo-wall'
import { LocationsSection } from '@/components/site/locations/locations-section'
import { getLocations } from '@/data/get-locations'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Unlocked Ventures is an AI-native digital development company. We combine strategic advisory with hands-on engineering so the plan and the product come from the same team.',
}

export default async function AboutPage() {
  const locations = await getLocations()

  return (
    <div className="bg-white">
      <AboutHero />
      <AboutLogoWall />
      <AboutDelivered />
      <AboutLogoWall spaced />
      <AboutFounder />
      <AboutHowWeWork />
      {locations ? <LocationsSection {...locations} /> : null}
    </div>
  )
}
