import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { linkField } from '@/admin/editor-fields'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: {
    singular: 'Case study',
    plural: 'Case studies',
  },
  admin: {
    group: adminGroups.homepage,
    description: 'Stories shown on the homepage. The heading and button are edited under Success stories.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'featured', 'sortOrder'],
  },
  access: {
    read: () => true,
  },
  defaultSort: 'sortOrder',
  fields: [
    { name: 'title', type: 'text', required: true },
    linkField(),
    { name: 'ctaLabel', type: 'text', label: 'Button text', required: true },
    { name: 'category', type: 'text' },
    { name: 'badge', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Large story',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Turn this on to show the story as the large one.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Order',
      required: true,
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
  ],
}
