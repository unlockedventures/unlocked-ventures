import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { buttonGroup } from '@/admin/editor-fields'

export const SuccessStories: GlobalConfig = {
  slug: 'success-stories',
  label: 'Success stories',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading and button for the case studies on the homepage. Each story is edited under Case studies.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Heading',
      required: true,
    },
    buttonGroup(),
  ],
}
