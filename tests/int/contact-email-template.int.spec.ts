import { describe, expect, it } from 'vitest'

import {
  DEFAULT_CONTACT_EMAIL_BODY,
  DEFAULT_CONTACT_EMAIL_SUBJECT,
  lexicalEmailToHtml,
  renderContactEmailTemplate,
  resolveContactEmailHtml,
} from '@/lib/contact/email-template'

const vars = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  company: 'Analytical Engines',
  email: 'ada@example.com',
  countryCode: '+1',
  phone: '555-0100',
  message: 'Hello there',
}

describe('renderContactEmailTemplate', () => {
  it('replaces known placeholders', () => {
    expect(renderContactEmailTemplate(DEFAULT_CONTACT_EMAIL_SUBJECT, vars)).toBe(
      'New contact message from Ada Lovelace',
    )
  })

  it('leaves unknown placeholders empty', () => {
    expect(renderContactEmailTemplate('Hi {{missing}}', vars)).toBe('Hi ')
  })
})

describe('resolveContactEmailHtml', () => {
  it('converts rich text body to HTML with placeholders intact', () => {
    const html = resolveContactEmailHtml({ body: DEFAULT_CONTACT_EMAIL_BODY })
    expect(html).toContain('{{firstName}}')
    expect(html).toContain('{{message}}')
    expect(lexicalEmailToHtml(DEFAULT_CONTACT_EMAIL_BODY)).toContain('<p>')
  })
})

