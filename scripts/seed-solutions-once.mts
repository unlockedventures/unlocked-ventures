import { getPayload } from 'payload'
import config from '@payload-config'

import { seedSolutions } from '../src/data/seed-solutions.ts'

const payload = await getPayload({ config })
await seedSolutions(payload)

const result = await payload.find({ collection: 'solutions', limit: 100, depth: 0 })
console.log(`Solutions seeded: ${result.totalDocs}`)
process.exit(0)
