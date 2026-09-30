import type { GroupField, NumberField, TextField } from 'payload'

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
