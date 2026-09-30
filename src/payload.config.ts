import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Awards } from './collections/Awards'
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
import { seedSite } from './data/seed-site'
import { Contact } from './globals/Contact'
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
      views: {
        login: {
          Component: '@/components/admin/login-view#LoginView',
        },
      },
    },
  },
  collections: [Users, Media, Awards],
  globals: [
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
    TrustedBy,
    Contact,
    Site,
  ],
  onInit: async (payload) => {
    await seedAwards(payload)
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
    await seedContact(payload)
    await seedSite(payload)
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
