import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About page',
  admin: {
    group: adminGroups.pages,
    description: 'Copy and pictures for the About page.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'metaTitle', type: 'text', label: 'Browser tab title', required: true },
    { name: 'metaDescription', type: 'textarea', label: 'Short summary', required: true },
    { name: 'breadcrumbHomeLabel', type: 'text', label: 'Home link text', required: true },
    { name: 'breadcrumbHomeHref', type: 'text', label: 'Home link', required: true },
    { name: 'breadcrumbCurrent', type: 'text', label: 'Current page name', required: true },
    { name: 'title', type: 'textarea', label: 'Heading', required: true },
    { name: 'description', type: 'textarea', label: 'Introduction', required: true },
    { name: 'badgeImage', type: 'upload', relationTo: 'media', label: 'Experience badge' },
    { name: 'badgeAlt', type: 'text', label: 'Badge description', required: true },
    { name: 'heroImage', type: 'upload', relationTo: 'media', label: 'Team photo', required: true },
    { name: 'heroImageAlt', type: 'text', label: 'Team photo description', required: true },
    { name: 'logoTitle', type: 'text', label: 'Logo wall heading', required: true },
    {
      name: 'logos',
      type: 'array',
      label: 'Logos',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'displayWidth', type: 'number', required: true },
        { name: 'displayHeight', type: 'number', required: true },
      ],
    },
    { name: 'deliveredTitle', type: 'text', label: 'Results heading', required: true },
    {
      name: 'stats',
      type: 'array',
      label: 'Results',
      fields: [
        { name: 'value', type: 'text', required: true },
        { name: 'label', type: 'text', required: true },
      ],
    },
    { name: 'founderRole', type: 'text', label: 'Founder role', required: true },
    { name: 'founderTitle', type: 'textarea', label: 'Founder heading', required: true },
    { name: 'founderSummary', type: 'textarea', label: 'Founder summary', required: true },
    { name: 'founderBio', type: 'textarea', label: 'Founder biography', required: true },
    { name: 'founderImage', type: 'upload', relationTo: 'media', label: 'Founder photo', required: true },
    { name: 'founderImageAlt', type: 'text', label: 'Founder photo description', required: true },
    { name: 'founderCtaLabel', type: 'text', label: 'Founder button text', required: true },
    { name: 'founderCtaHref', type: 'text', label: 'Founder button link', required: true },
    {
      name: 'experienceTitle',
      type: 'text',
      label: 'Experience heading',
      required: true,
      defaultValue: 'Experience',
    },
    {
      name: 'experienceRoles',
      type: 'array',
      label: 'Experience roles',
      admin: {
        description: 'Accordion rows on the About page Experience section. The first open row expands by default.',
      },
      fields: [
        { name: 'role', type: 'text', label: 'Role title', required: true },
        { name: 'company', type: 'text', label: 'Company', required: true },
        {
          name: 'dateLabel',
          type: 'text',
          label: 'Date label',
          required: true,
          admin: { description: 'Shown in the pill, for example: Aug 2023 – Present · 3 yrs 1 mo' },
        },
        { name: 'summary', type: 'textarea', label: 'Summary' },
        {
          name: 'highlights',
          type: 'array',
          label: 'Highlights',
          fields: [{ name: 'text', type: 'text', required: true }],
        },
        {
          name: 'defaultOpen',
          type: 'checkbox',
          label: 'Open by default',
          defaultValue: false,
        },
      ],
    },
    { name: 'howWeWorkTitle', type: 'text', label: 'How we work heading', required: true },
    {
      name: 'principles',
      type: 'array',
      label: 'Ways of working',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        { name: 'icon', type: 'upload', relationTo: 'media', required: true },
        { name: 'iconWidth', type: 'number', required: true },
        { name: 'iconHeight', type: 'number', required: true },
      ],
    },
  ],
}
