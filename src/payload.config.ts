import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { seedAbout } from './data/seed-about'
import { seedAwardsSection } from './data/seed-awards-section'
import { seedOurSuccesses } from './data/seed-our-successes'
import { seedPodcastPage } from './data/seed-podcast-page'
import { Awards } from './collections/Awards'
import { CaseStudies } from './collections/CaseStudies'
import { NewsPosts } from './collections/NewsPosts'
import { Pipeline } from './collections/Pipeline'
import { PodcastEpisodes } from './collections/PodcastEpisodes'
import { TrustedLogos } from './collections/TrustedLogos'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { seedAwards } from './data/seed-awards'
import { seedDigitalEngineering } from './data/seed-digital-engineering'
import { seedFooter } from './data/seed-footer'
import { seedHeader } from './data/seed-header'
import { seedHero } from './data/seed-hero'
import { seedNavigation } from './data/seed-navigation'
import { seedLatestNews } from './data/seed-latest-news'
import { seedLocations } from './data/seed-locations'
import { seedRecentPodcast } from './data/seed-recent-podcast'
import { seedStrategicGrowth } from './data/seed-strategic-growth'
import { seedStrategicAdvisory } from './data/seed-strategic-advisory'
import { seedTrustedBy } from './data/seed-trusted-by'
import { seedSuccessStories } from './data/seed-success-stories'
import { seedContact } from './data/seed-contact'
import { classifyMedia } from './data/classify-media'
import { seedSite } from './data/seed-site'
import { About } from './globals/About'
import { AwardsSection } from './globals/AwardsSection'
import { Contact } from './globals/Contact'
import { OurSuccesses } from './globals/OurSuccesses'
import { PodcastPage } from './globals/PodcastPage'
import { DigitalEngineering } from './globals/DigitalEngineering'
import { Footer } from './globals/Footer'
import { Header } from './globals/Header'
import { Hero } from './globals/Hero'
import { Navigation } from './globals/Navigation'
import { LatestNews } from './globals/LatestNews'
import { Locations } from './globals/Locations'
import { RecentPodcast } from './globals/RecentPodcast'
import { StrategicGrowth } from './globals/StrategicGrowth'
import { TrustedBy } from './globals/TrustedBy'
import { StrategicAdvisory } from './globals/StrategicAdvisory'
import { Site } from './globals/Site'
import { SuccessStories } from './globals/SuccessStories'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      Nav: '@/components/admin/admin-nav#AdminNav',
      views: {
        dashboard: {
          Component: '@/components/admin/admin-home#AdminHome',
        },
        login: {
          Component: '@/components/admin/login-view#LoginView',
        },
      },
    },
  },
  collections: [Users, Media, Awards, NewsPosts, PodcastEpisodes, CaseStudies, TrustedLogos, Pipeline],
  globals: [
    About,
    AwardsSection,
    Hero,
    Navigation,
    DigitalEngineering,
    Footer,
    Header,
    LatestNews,
    Locations,
    RecentPodcast,
    StrategicGrowth,
    StrategicAdvisory,
    SuccessStories,
    OurSuccesses,
    PodcastPage,
    TrustedBy,
    Contact,
    Site,
  ],
  onInit: async (payload) => {
    await seedAwards(payload)
    await seedAwardsSection(payload)
    await seedAbout(payload)
    await seedHero(payload)
    await seedDigitalEngineering(payload)
    await seedFooter(payload)
    await seedHeader(payload)
    await seedNavigation(payload)
    await seedLatestNews(payload)
    await seedLocations(payload)
    await seedRecentPodcast(payload)
    await seedStrategicGrowth(payload)
    await seedStrategicAdvisory(payload)
    await seedTrustedBy(payload)
    await seedSuccessStories(payload)
    await seedOurSuccesses(payload)
    await seedPodcastPage(payload)
    await seedContact(payload)
    await seedSite(payload)
    await classifyMedia(payload)
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // Docker sets this to false after the database exists. A schema warning
    // otherwise waits for a keypress that `docker compose up` cannot provide.
    push: process.env.PAYLOAD_DB_PUSH !== 'false',
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
