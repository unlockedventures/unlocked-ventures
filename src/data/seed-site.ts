import type { Payload } from 'payload'

import { siteSeed } from '@/data/site-seed'
import { isLexicalEditorState } from '@/lib/contact/email-template'

export async function seedSite(payload: Payload) {
  const current = await payload.findGlobal({ slug: 'site' })
  if (current.title) {
    const patch: Record<string, unknown> = {}
    if (!current.errorTitle) {
      patch.errorMetaTitle = siteSeed.errorMetaTitle
      patch.errorLabel = siteSeed.errorLabel
      patch.errorTitle = siteSeed.errorTitle
      patch.errorDescription = siteSeed.errorDescription
    }
    if (!current.contactEmailSubject) {
      patch.contactEmailSubject = siteSeed.contactEmailSubject
    }
    if (!isLexicalEditorState(current.contactEmailBody)) {
      patch.contactEmailBody = siteSeed.contactEmailBody
    }
    if (!current.contactEmailHtml) {
      patch.contactEmailHtml = siteSeed.contactEmailHtml
    }
    if (Object.keys(patch).length > 0) {
      await payload.updateGlobal({ slug: 'site', data: patch })
    }
    return
  }

  await payload.updateGlobal({
    slug: 'site',
    data: siteSeed,
  })
}
