import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Browser title and missing pages',
  admin: {
    group: adminGroups.settings,
    description: 'The name in the browser tab, and the message shown when a page cannot be found.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Browser tab title',
      required: true,
      admin: {
        description: 'Shown in the browser tab and in search results.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Short summary',
      required: true,
      admin: {
        description: 'A sentence search engines can show under the site name.',
      },
    },
    {
      name: 'notFoundMetaTitle',
      type: 'text',
      label: 'Missing page browser title',
      required: true,
    },
    {
      name: 'notFoundLabel',
      type: 'text',
      label: 'Small label',
      required: true,
    },
    {
      name: 'notFoundTitle',
      type: 'text',
      label: 'Heading',
      required: true,
    },
    {
      name: 'notFoundDescription',
      type: 'textarea',
      label: 'Message',
      required: true,
      admin: {
        description: 'Shown when someone opens a page that does not exist.',
      },
    },
    {
      name: 'homeButtonLabel',
      type: 'text',
      label: 'Home button text',
      required: true,
    },
    {
      name: 'errorMetaTitle',
      type: 'text',
      label: 'Error page browser title',
    },
    {
      name: 'errorLabel',
      type: 'text',
      label: 'Error label',
    },
    {
      name: 'errorTitle',
      type: 'text',
      label: 'Error heading',
    },
    {
      name: 'errorDescription',
      type: 'textarea',
      label: 'Error message',
      admin: {
        description: 'Shown when a page fails to load.',
      },
    },
  ],
}
