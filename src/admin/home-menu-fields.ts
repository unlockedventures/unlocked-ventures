import type { Field } from 'payload'

export const homeMenuSourceField: Field = {
  name: 'menuSource',
  type: 'text',
  label: 'Header menu source',
  admin: {
    description:
      'Choose the Header menu parent supplying this section. Edit its headings and links in Header menu.',
    components: { Field: '@/components/admin/home-menu-source-field#HomeMenuSourceField' },
  },
}

export const homeMenuGroupField: Field = {
  name: 'sourceGroupId',
  type: 'text',
  label: 'Group name',
  admin: {
    readOnly: true,
    description: 'Automatically created from the selected Header menu.',
    components: { Field: '@/components/admin/home-menu-source-field#HomeMenuGroupField' },
  },
}

export const homeMenuPresentationArchive: Field = {
  name: 'menuPresentationArchive',
  type: 'json',
  admin: { hidden: true },
}

export const homeMenuPresentationAdmin = {
  isSortable: false,
  description:
    'Groups are created automatically from the selected Header menu. Edit only their presentation here.',
  components: { Field: '@/components/admin/home-menu-source-field#HomeMenuPresentationField' },
}
