import type { GlobalConfig } from 'payload'

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
  label: 'Contact',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'metaTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      required: true,
    },
    {
      name: 'breadcrumbHomeLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'breadcrumbHomeHref',
      type: 'text',
      required: true,
    },
    {
      name: 'breadcrumbCurrent',
      type: 'text',
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
      relationTo: 'media',
    },
    {
      name: 'cards',
      type: 'array',
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        { name: 'icon', type: 'upload', relationTo: 'media', required: true },
        { name: 'displayWidth', type: 'number', required: true, min: 1 },
        { name: 'displayHeight', type: 'number', required: true, min: 1 },
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
      fields: [
        { name: 'successMessage', type: 'text', required: true },
        { name: 'submitLabel', type: 'text', required: true },
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
