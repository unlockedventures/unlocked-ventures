import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { linkField } from '@/admin/editor-fields'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  labels: {
    singular: 'Success story',
    plural: 'Success Stories',
  },
  admin: {
    group: adminGroups.successStories,
    description:
      'Every success story. Check Show on the homepage to include a story there. The box saves when you click it. The first checked story in this list is the large one.',
    hideAPIURL: true,
    useAsTitle: 'title',
    defaultColumns: ['title', 'headerNavChild', 'featured'],
  },
  access: {
    read: () => true,
  },
  defaultSort: 'sortOrder',
  fields: [
    {
      name: 'headerNavChild',
      type: 'text',
      label: 'Success category',
      required: true,
      index: true,
      admin: {
        description:
          'Required. Choose a service from Strategic Advisory or Digital Engineering in the Main menu.',
        components: {
          Field: '@/components/admin/header-nav-child-field#HeaderNavChildField',
        },
      },
    },
    { name: 'title', type: 'text', required: true },
    linkField(),
    { name: 'ctaLabel', type: 'text', label: 'Button text', required: true },
    { name: 'category', type: 'text', label: 'Category label', admin: { description: 'Optional badge text on cards.' } },
    { name: 'badge', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', label: 'Picture', relationTo: 'media', admin: { description: 'The photo on this story. Choose a different file to replace it.' } },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Show on the homepage',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Turn this on, then save, to include this story in the homepage Success stories section. The first homepage story is the large one.',
        components: {
          Cell: '@/components/admin/featured-cell#FeaturedCell',
        },
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Order',
      required: true,
      defaultValue: 0,
      admin: { hidden: true },
    },
  ],
}
