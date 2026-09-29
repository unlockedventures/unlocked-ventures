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
import { DigitalEngineering } from './globals/DigitalEngineering'

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
  globals: [DigitalEngineering],
  onInit: async (payload) => {
    await seedAwards(payload)
    await seedDigitalEngineering(payload)
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
