import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

/** Lean editor for contact-form email templates (placeholders stay as plain text). */
export const emailTemplateEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [...defaultFeatures, FixedToolbarFeature()],
})
