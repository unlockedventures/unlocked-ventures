import type { CollectionConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'

const authenticated = ({ req }: { req: { user?: unknown } }) => Boolean(req.user)

/**
 * Inbound contact-form messages. Editors can view the list; create/update/delete
 * are closed in admin (submissions arrive via the public API with overrideAccess).
 */
export const ContactMessages: CollectionConfig = {
  slug: 'contact-messages',
  labels: {
    singular: 'Contact message',
    plural: 'Contact messages',
  },
  admin: {
    group: adminGroups.inbox,
    description: 'Messages sent from the contact page. View only — editing is disabled.',
    hideAPIURL: true,
    useAsTitle: 'email',
    defaultColumns: ['firstName', 'lastName', 'email', 'company', 'createdAt'],
  },
  disableDuplicate: true,
  disableBulkEdit: true,
  disableBulkDelete: true,
  access: {
    create: () => false,
    read: authenticated,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'firstName',
      type: 'text',
      label: 'First name',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last name',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'countryCode',
      type: 'text',
      label: 'Country code',
      admin: { readOnly: true },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone',
      admin: { readOnly: true },
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Message',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'emailSent',
      type: 'checkbox',
      label: 'Owner email sent',
      defaultValue: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Whether the notification email reached the owner address.',
      },
    },
  ],
  timestamps: true,
}
