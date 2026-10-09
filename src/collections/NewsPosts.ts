import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { linkField } from '@/admin/editor-fields'

export const NewsPosts: CollectionConfig = {
  slug: 'news-posts',
  labels: {
    singular: 'Article',
    plural: 'News and blogs',
  },
  admin: {
    group: adminGroups.news,
    description:
      'Every news article. Check Show on the homepage to include an article there. The box saves when you click it.',
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
    { name: 'excerpt', type: 'textarea', required: true },
    linkField(),
    { name: 'ctaLabel', type: 'text', label: 'Button text', required: true, defaultValue: 'Read More' },
    {
      name: 'image',
      type: 'upload',
      label: 'Picture',
      relationTo: 'media',
      admin: { description: 'The photo on this article. Choose a different file to replace it.' },
    },
    { name: 'imageAlt', type: 'text' },
    {
      name: 'authorName',
      type: 'text',
      label: 'Author name',
      admin: { description: 'Shown under the title on the article page.' },
    },
    {
      name: 'authorImage',
      type: 'upload',
      label: 'Author photo',
      relationTo: 'media',
      admin: { description: 'Circular photo next to the author name.' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published date',
      admin: {
        description: 'Shown next to the author, for example Sep 20, 2024.',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'MMM d, yyyy' },
      },
    },
    {
      name: 'readTime',
      type: 'text',
      label: 'Read time',
      admin: { description: 'For example: 7 min read' },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      admin: { description: 'Pill labels at the bottom of the article.' },
      fields: [{ name: 'label', type: 'text', required: true }],
    },
    {
      name: 'body',
      type: 'blocks',
      label: 'Article body',
      admin: {
        description: 'The full article on the Insights detail page. Headings appear in the table of contents.',
      },
      blocks: [
        {
          slug: 'paragraph',
          labels: { singular: 'Paragraph', plural: 'Paragraphs' },
          fields: [{ name: 'text', type: 'textarea', required: true }],
        },
        {
          slug: 'heading',
          labels: { singular: 'Heading', plural: 'Headings' },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: { description: 'Shown in the article and in the “In this article” list.' },
            },
          ],
        },
        {
          slug: 'quote',
          labels: { singular: 'Quote', plural: 'Quotes' },
          fields: [
            { name: 'text', type: 'textarea', required: true },
            { name: 'attribution', type: 'text', label: 'Attribution' },
          ],
        },
        {
          slug: 'list',
          labels: { singular: 'List', plural: 'Lists' },
          fields: [
            {
              name: 'items',
              type: 'array',
              required: true,
              minRows: 1,
              fields: [{ name: 'text', type: 'text', required: true }],
            },
          ],
        },
        {
          slug: 'image',
          labels: { singular: 'Image', plural: 'Images' },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              label: 'Picture',
            },
            { name: 'imageAlt', type: 'text', label: 'Alt text' },
          ],
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Show on the homepage',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Turn this on to include this article in the homepage News and blogs section.',
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
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
  ],
}
