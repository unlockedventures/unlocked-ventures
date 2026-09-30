import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { buttonGroup } from '@/admin/editor-fields'

export const Header: GlobalConfig = {
  slug: 'site-header',
  label: 'Header button',
  admin: {
    group: adminGroups.menus,
    description: 'The button at the top of every page. It currently says Get in touch.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [buttonGroup()],
}
