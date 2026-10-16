import type { CollapsibleField, Field, GroupField, NumberField, TextField, UIField } from 'payload'

import { linkHint, sizeHint } from '@/admin/editor-guide'

type SeoFieldsOptions = {
  /** When true, editors must fill both fields (listing/globals). Detail docs stay optional. */
  required?: boolean
  /** Start the SEO panel collapsed (useful on long collection forms). */
  initCollapsed?: boolean
}

/** Flat meta title + description fields (for tabs or custom layouts). */
export function seoFieldDefs(options: Pick<SeoFieldsOptions, 'required'> = {}): Field[] {
  const required = options.required ?? false
  return [
    {
      name: 'metaTitle',
      type: 'text',
      label: 'Meta title',
      required,
      admin: {
        description: 'Shown in the browser tab and search-result title.',
      },
    },
    {
      name: 'metaDescription',
      type: 'textarea',
      label: 'Meta description',
      required,
      admin: {
        description: 'One or two sentences search engines can show under the title.',
        rows: 3,
      },
    },
  ]
}

/** Shared SEO panel for public pages and content. */
export function seoFields(options: SeoFieldsOptions = {}): CollapsibleField[] {
  return [
    {
      type: 'collapsible',
      label: 'SEO',
      admin: {
        initCollapsed: options.initCollapsed ?? false,
        description: 'Browser tab title and the short summary search engines can show.',
      },
      fields: seoFieldDefs(options),
    },
  ]
}

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
