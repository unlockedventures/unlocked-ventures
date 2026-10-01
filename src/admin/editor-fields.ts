import type { GroupField, NumberField, TextField, UIField } from 'payload'

import { linkHint, sizeHint } from '@/admin/editor-guide'

export function linkField(): TextField {
  return {
    name: 'href',
    type: 'text',
    label: 'Link',
    required: true,
    admin: {
      description: linkHint,
    },
  }
}

export function buttonGroup(): GroupField {
  return {
    name: 'cta',
    type: 'group',
    label: 'Button',
    fields: [
      {
        name: 'label',
        type: 'text',
        label: 'Text',
        required: true,
      },
      linkField(),
    ],
  }
}

export function relatedItemsField(options: {
  name: string
  label: string
  collection: string
  titleField: string
  imageField: string
  singular: string
  plural: string
  help: string
  where?: string
  readOnly?: boolean
  manageLabel?: string
}): UIField {
  return {
    name: options.name,
    type: 'ui',
    label: options.label,
    admin: {
      components: {
        Field: '@/components/admin/related-items-field#RelatedItemsField',
      },
      custom: {
        collection: options.collection,
        titleField: options.titleField,
        imageField: options.imageField,
        singular: options.singular,
        plural: options.plural,
        help: options.help,
        where: options.where ?? '',
        readOnly: options.readOnly ?? false,
        manageLabel: options.manageLabel ?? '',
      },
    },
  }
}

export function sizeField(name: 'displayWidth' | 'displayHeight' | 'iconWidth' | 'iconHeight', label: string): NumberField {
  return {
    name,
    type: 'number',
    label,
    required: true,
    min: 1,
    admin: {
      description: sizeHint,
    },
  }
}
