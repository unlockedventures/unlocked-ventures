import { HeroSection, homepageHero } from '@/components/site/hero/hero-section'
import {
  homepageLocationStats,
  LocationsSection,
} from '@/components/site/locations/locations-section'

export default function HomePage() {
  return (
    <>
      <HeroSection {...homepageHero} />
      <LocationsSection stats={homepageLocationStats} className="bg-white" />
    </>
  )
}
