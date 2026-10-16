import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'

import { lexicalFromParagraphs } from '@/lib/lexical-plain'
import { absoluteUrl } from '@/lib/site-url'

export type ContactEmailVars = {
  firstName: string
  lastName: string
  company: string
  email: string
  countryCode: string
  phone: string
  message: string
}

const PLACEHOLDER = /\{\{\s*(\w+)\s*\}\}/g

/** Sample values for the admin live preview. */
export const CONTACT_EMAIL_PREVIEW_VARS: ContactEmailVars = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  company: 'Analytical Engines',
  email: 'ada@example.com',
  countryCode: '+1',
  phone: '555-0100',
  message: 'I would like to learn more about your advisory work.',
}

/** Replace `{{key}}` tokens in a template with values from vars (missing → empty). */
export function renderContactEmailTemplate(
  template: string,
  vars: ContactEmailVars,
): string {
  return template.replace(PLACEHOLDER, (_match, key: string) => {
    const value = vars[key as keyof ContactEmailVars]
    return value == null ? '' : String(value)
  })
}

export const DEFAULT_CONTACT_EMAIL_SUBJECT =
  'New contact message from {{firstName}} {{lastName}}'

export const DEFAULT_CONTACT_EMAIL_HTML = `<p>You received a new message from the contact form.</p>
<p><strong>Name:</strong> {{firstName}} {{lastName}}<br/>
<strong>Company:</strong> {{company}}<br/>
<strong>Email:</strong> {{email}}<br/>
<strong>Phone:</strong> {{countryCode}} {{phone}}</p>
<p><strong>Message:</strong></p>
<p>{{message}}</p>`

export const DEFAULT_CONTACT_EMAIL_BODY: DefaultTypedEditorState = lexicalFromParagraphs([
  'You received a new message from the contact form.',
  'Name: {{firstName}} {{lastName}}',
  'Company: {{company}}',
  'Email: {{email}}',
  'Phone: {{countryCode}} {{phone}}',
  'Message:',
  '{{message}}',
])

export function isLexicalEditorState(value: unknown): value is DefaultTypedEditorState {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'root' in value &&
      (value as { root?: unknown }).root &&
      typeof (value as { root: unknown }).root === 'object',
  )
}

/** Email-friendly img markup (simple <img>, max-width for clients). */
function emailUploadConverter({
  node,
}: {
  node: {
    value?: {
      url?: string | null
      alt?: string | null
      filename?: string | null
      mimeType?: string | null
      width?: number | null
      height?: number | null
    }
    fields?: { alt?: string | null }
  }
}) {
  const uploadDoc = typeof node.value === 'object' && node.value ? node.value : null
  if (!uploadDoc?.url) return ''

  const url = uploadDoc.url
  const alt = node.fields?.alt || uploadDoc.alt || uploadDoc.filename || ''
  const mime = uploadDoc.mimeType || ''

  if (mime && !mime.startsWith('image')) {
    return `<a href="${url}" rel="noopener noreferrer">${alt || url}</a>`
  }

  const width = uploadDoc.width ? ` width="${uploadDoc.width}"` : ''
  const height = uploadDoc.height ? ` height="${uploadDoc.height}"` : ''
  return `<img src="${url}" alt="${alt}"${width}${height} style="max-width:100%;height:auto;display:block;border:0;outline:none;text-decoration:none;" />`
}

/** Turn Lexical JSON into HTML for outbound email (no outer container). */
export function lexicalEmailToHtml(data: DefaultTypedEditorState): string {
  return convertLexicalToHTML({
    data,
    disableContainer: true,
    // Custom upload converter: email-safe <img> (no <picture>), works once value is populated.
    converters: ({ defaultConverters }: { defaultConverters: Record<string, unknown> }) =>
      ({
        ...defaultConverters,
        upload: emailUploadConverter,
      }) as never,
  } as Parameters<typeof convertLexicalToHTML>[0])
}

/** Make relative media URLs absolute so email clients can load images. */
export function absolutizeEmailHtml(html: string): string {
  return html
    .replace(/\bsrc="(\/[^"]+)"/g, (_match, path: string) => `src="${absoluteUrl(path)}"`)
    .replace(/\bhref="(\/[^"]+)"/g, (_match, path: string) => `href="${absoluteUrl(path)}"`)
}

/**
 * Resolve the HTML body from Site settings: prefer rich text, then legacy textarea HTML.
 * Pass already-populated Lexical JSON when images should appear.
 */
export function resolveContactEmailHtml(args: {
  body?: unknown
  legacyHtml?: string | null
  absoluteUrls?: boolean
}): string {
  let html = ''
  if (isLexicalEditorState(args.body)) {
    html = lexicalEmailToHtml(args.body).trim()
  }
  if (!html && typeof args.legacyHtml === 'string' && args.legacyHtml.trim()) {
    html = args.legacyHtml.trim()
  }
  if (!html) html = DEFAULT_CONTACT_EMAIL_HTML
  return args.absoluteUrls ? absolutizeEmailHtml(html) : html
}
