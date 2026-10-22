import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { seedAbout } from './data/seed-about'
import { seedAwardsSection } from './data/seed-awards-section'
import { seedInsights } from './data/seed-insights'
import { seedOurSuccesses } from './data/seed-our-successes'
import { seedPodcastListing } from './data/seed-podcast-listing'
import { seedPodcastPage } from './data/seed-podcast-page'
import { Awards } from './collections/Awards'
import { CaseStudies } from './collections/CaseStudies'
import { SuccessBadges } from './collections/SuccessBadges'
import { ContactMessages } from './collections/ContactMessages'
import { NewsPosts } from './collections/NewsPosts'
import { PodcastAudio } from './collections/PodcastAudio'
import { PodcastChannels } from './collections/PodcastChannels'
import { PodcastEpisodes } from './collections/PodcastEpisodes'
import { Solutions } from './collections/Solutions'
import { TrustedLogos } from './collections/TrustedLogos'
import { Users } from './collections/Users'
import { Roles } from './collections/Roles'
import { collectionRBAC, globalRBAC } from './access/rbac'
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
import { seedSolutions } from './data/seed-solutions'
import { seedStrategicAdvisory } from './data/seed-strategic-advisory'
import { seedTrustedBy } from './data/seed-trusted-by'
import { seedSuccessStories } from './data/seed-success-stories'
import { migrateDevelopData } from './data/migrate-develop-data'
import { seedContact } from './data/seed-contact'
import { classifyMedia } from './data/classify-media'
import { seedSite } from './data/seed-site'
import { About } from './globals/About'
import { AwardsSection } from './globals/AwardsSection'
import { Contact } from './globals/Contact'
import { Insights } from './globals/Insights'
import { OurSuccesses } from './globals/OurSuccesses'
import { PodcastListing } from './globals/PodcastListing'
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
import { dashboardStatsHandler } from './endpoints/dashboard-stats'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      providers: ['@/components/admin/admin-hydration-provider#AdminHydrationProvider'],
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
  collections: [
    Users,
    Roles,
    Media,
    Awards,
    NewsPosts,
    PodcastAudio,
    PodcastChannels,
    PodcastEpisodes,
    CaseStudies,
    SuccessBadges,
    Solutions,
    TrustedLogos,
    ContactMessages,
  ].map(collectionRBAC),
  email: process.env.SMTP_HOST
    ? await nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'noreply@unlockedventures.com',
        defaultFromName: process.env.SMTP_FROM_NAME || 'Unlocked Ventures',
        skipVerify: process.env.SMTP_SKIP_VERIFY === 'true',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: process.env.SMTP_SECURE === 'true',
          auth:
            process.env.SMTP_USER && process.env.SMTP_PASS
              ? {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
                }
              : undefined,
        },
      })
    : undefined,
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
    Insights,
    PodcastListing,
    PodcastPage,
    TrustedBy,
    Contact,
    Site,
  ].map(globalRBAC),
  onInit: async (payload) => {
    const seeds: { name: string; run: () => Promise<void> }[] = [
      // Schema-adjacent data backfill for existing DBs after pulling develop.
      { name: 'migrate-develop-data', run: () => migrateDevelopData(payload) },
      { name: 'awards', run: () => seedAwards(payload) },
      { name: 'awards-section', run: () => seedAwardsSection(payload) },
      { name: 'about', run: () => seedAbout(payload) },
      { name: 'hero', run: () => seedHero(payload) },
      { name: 'digital-engineering', run: () => seedDigitalEngineering(payload) },
      { name: 'footer', run: () => seedFooter(payload) },
      { name: 'header', run: () => seedHeader(payload) },
      { name: 'navigation', run: () => seedNavigation(payload) },
      { name: 'latest-news', run: () => seedLatestNews(payload) },
      { name: 'locations', run: () => seedLocations(payload) },
      { name: 'recent-podcast', run: () => seedRecentPodcast(payload) },
      { name: 'solutions', run: () => seedSolutions(payload) },
      { name: 'strategic-advisory', run: () => seedStrategicAdvisory(payload) },
      { name: 'trusted-by', run: () => seedTrustedBy(payload) },
      { name: 'success-stories', run: () => seedSuccessStories(payload) },
      { name: 'our-successes', run: () => seedOurSuccesses(payload) },
      { name: 'insights', run: () => seedInsights(payload) },
      { name: 'podcast-listing', run: () => seedPodcastListing(payload) },
      { name: 'podcast-page', run: () => seedPodcastPage(payload) },
      { name: 'contact', run: () => seedContact(payload) },
      { name: 'site', run: () => seedSite(payload) },
      { name: 'classify-media', run: () => classifyMedia(payload) },
    ]

    for (const seed of seeds) {
      try {
        await seed.run()
      } catch (error) {
        // One seed must not prevent the app from serving after Docker start.
        payload.logger.error({ err: error, seed: seed.name }, `Seed failed: ${seed.name}`)
      }
    }
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    // Docker sets this to false after the database exists. A schema warning
    // otherwise waits for a keypress that `docker compose up` cannot provide.
    // Existing volumes get additive updates from scripts/ensure-schema.sql in
    // docker-dev.sh (and `pnpm ensure-schema` / `pnpm migrate` outside Docker).
    push: process.env.PAYLOAD_DB_PUSH !== 'false',
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
  endpoints: [
    {
      path: '/dashboard/stats',
      method: 'get',
      handler: dashboardStatsHandler,
    },
  ],
})
