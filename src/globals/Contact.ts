import type { GlobalConfig } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { linkField, seoFields, sizeField } from '@/admin/editor-fields'

const labeledField = (name: string, label: string) => ({
  name,
  type: 'group' as const,
  label,
  fields: [
    { name: 'label', type: 'text' as const, required: true },
    { name: 'placeholder', type: 'text' as const, required: true },
  ],
})

export const Contact: GlobalConfig = {
  slug: 'contact',
  label: 'Contact page',
  admin: {
    group: adminGroups.pages,
    description: 'The page people reach from Get in touch, including the form they fill in.',
    hideAPIURL: true,
  },
  access: {
    read: () => true,
  },
  fields: [
    ...seoFields({ required: true }),
    {
      name: 'breadcrumbHomeLabel',
      type: 'text',
      label: 'Home link text',
      required: true,
    },
    {
      name: 'breadcrumbHomeHref',
      type: 'text',
      label: 'Home link',
      required: true,
      admin: {
        description: 'Usually /. This is where the Home step in the path goes.',
      },
    },
    {
      name: 'breadcrumbCurrent',
      type: 'text',
      label: 'Current page name',
      required: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'illustration',
      type: 'upload',
      label: 'Illustration',
      relationTo: 'media',
      admin: {
        description: 'Choose a different file to replace this picture.',
      },
    },
    {
      name: 'cards',
      type: 'array',
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      fields: [
        { name: 'label', type: 'text', label: 'Label', required: true },
        { name: 'value', type: 'text', label: 'Details', required: true },
        linkField(),
        { name: 'icon', type: 'upload', label: 'Icon', relationTo: 'media', required: true, admin: { description: 'Choose a different file to replace this icon. Add or remove a card with the controls on this list.' } },
        sizeField('displayWidth', 'Icon width (pixels)'),
        sizeField('displayHeight', 'Icon height (pixels)'),
      ],
    },
    {
      name: 'helpTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'form',
      type: 'group',
      label: 'Form',
      fields: [
        { name: 'successMessage', type: 'text', label: 'Thank-you message', required: true },
        { name: 'submitLabel', type: 'text', label: 'Submit button text', required: true },
        { name: 'countryCode', type: 'text', required: true },
        { name: 'phoneLabel', type: 'text', required: true },
        { name: 'phonePlaceholder', type: 'text', required: true },
        { name: 'countryCodeLabel', type: 'text', required: true },
        { name: 'phoneAriaLabel', type: 'text', required: true },
        { name: 'requiredMessage', type: 'text', required: true },
        { name: 'invalidEmailMessage', type: 'text', required: true },
        { name: 'invalidCountryCodeMessage', type: 'text', required: true },
        { name: 'invalidPhoneMessage', type: 'text', required: true },
        labeledField('firstName', 'First name'),
        labeledField('lastName', 'Last name'),
        labeledField('company', 'Company'),
        labeledField('email', 'Email'),
        labeledField('message', 'Message'),
      ],
    },
  ],
}
