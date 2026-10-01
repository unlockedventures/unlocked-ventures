import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const AwardsSection: GlobalConfig = {
  slug: 'awards-section',
  label: 'Awards heading',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading above the award logos. The logos are edited under Awards.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [{ name: 'title', type: 'text', label: 'Heading', required: true }],
}
