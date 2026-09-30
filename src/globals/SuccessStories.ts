import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { buttonGroup, relatedItemsField } from '@/admin/editor-fields'

export const SuccessStories: GlobalConfig = {
  slug: 'success-stories',
  label: 'Success stories',
  admin: {
    group: adminGroups.homepage,
    description: 'The heading and button for the homepage section. Stories marked Show on the homepage are listed below.',
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
    relatedItemsField({
      name: 'stories',
      label: 'Stories',
      collection: 'case-studies',
      titleField: 'title',
      imageField: 'image',
      singular: 'story',
      plural: 'stories',
      help: 'Only stories marked Show on the homepage appear here and on the site, in this order. The first one is the large story. Add and manage every story under Success Stories.',
      where: 'where[featured][equals]=true',
    }),
  ],
}
