import type { Payload } from 'payload'

import {
  DEFAULT_CONTACT_EMAIL_HTML,
  DEFAULT_CONTACT_EMAIL_SUBJECT,
  renderContactEmailTemplate,
  type ContactEmailVars,
} from '@/lib/contact/email-template'

export type ContactSubmissionInput = ContactEmailVars

export type ContactSubmissionError = { ok: false; error: string; status: number }
export type ContactSubmissionResult =
  | { ok: true; id: number | string }
  | ContactSubmissionError

function trimRequired(value: unknown, label: string): string | ContactSubmissionError {
  if (typeof value !== 'string' || !value.trim()) {
    return { ok: false, error: `${label} is required`, status: 400 }
  }
  return value.trim()
}

export function parseContactSubmission(
  body: unknown,
): ContactSubmissionInput | ContactSubmissionError {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body', status: 400 }
  }

  const data = body as Record<string, unknown>
  const firstName = trimRequired(data.firstName, 'First name')
  if (typeof firstName !== 'string') return firstName
  const lastName = trimRequired(data.lastName, 'Last name')
  if (typeof lastName !== 'string') return lastName
  const company = trimRequired(data.company, 'Company')
  if (typeof company !== 'string') return company
  const email = trimRequired(data.email, 'Email')
  if (typeof email !== 'string') return email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'Invalid email', status: 400 }
  }
  const message = trimRequired(data.message, 'Message')
  if (typeof message !== 'string') return message

  const countryCode = typeof data.countryCode === 'string' ? data.countryCode.trim() : ''
  const phone = typeof data.phone === 'string' ? data.phone.trim() : ''

  return { firstName, lastName, company, email, countryCode, phone, message }
}

/**
 * Persists the message, then notifies the owner using the Site email template.
 * Persistence succeeds even if email delivery fails (emailSent stays false).
 */
export async function submitContactMessage(
  payload: Payload,
  input: ContactSubmissionInput,
): Promise<ContactSubmissionResult> {
  const created = await payload.create({
    collection: 'contact-messages',
    data: {
      ...input,
      emailSent: false,
    },
    overrideAccess: true,
  })

  const site = await payload.findGlobal({ slug: 'site', depth: 0 })
  const ownerEmail = site.ownerEmail?.trim()

  if (!ownerEmail) {
    payload.logger.warn('Contact message saved but ownerEmail is not set on Site settings')
    return { ok: true, id: created.id }
  }

  const subject = renderContactEmailTemplate(
    site.contactEmailSubject?.trim() || DEFAULT_CONTACT_EMAIL_SUBJECT,
    input,
  )
  const html = renderContactEmailTemplate(
    site.contactEmailHtml?.trim() || DEFAULT_CONTACT_EMAIL_HTML,
    input,
  )

  try {
    await payload.sendEmail({
      to: ownerEmail,
      subject,
      html,
      replyTo: input.email,
    })

    await payload.update({
      collection: 'contact-messages',
      id: created.id,
      data: { emailSent: true },
      overrideAccess: true,
    })
  } catch (error) {
    payload.logger.error({ err: error }, 'Failed to send contact owner email')
  }

  return { ok: true, id: created.id }
}
