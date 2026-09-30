import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { ContactPageContent } from '@/components/site/contact/conversation-section'
import type { ContactFormContent } from '@/components/site/contact/contact-form'

function mediaUrl(value: number | { url?: string | null } | null | undefined) {
  if (!value || typeof value === 'number' || !value.url) return undefined
  return value.url
}

export async function getContact(): Promise<ContactPageContent | null> {
  const payload = await getPayload({ config: configPromise })
  const doc = await payload.findGlobal({ slug: 'contact', depth: 1 })
  const form = doc.form

  if (
    !doc.metaTitle ||
    !doc.metaDescription ||
    !doc.breadcrumbHomeLabel ||
    !doc.breadcrumbHomeHref ||
    !doc.breadcrumbCurrent ||
    !doc.title ||
    !doc.helpTitle ||
    !form?.successMessage ||
    !form.submitLabel ||
    !form.firstName?.label ||
    !form.lastName?.label ||
    !form.company?.label ||
    !form.email?.label ||
    !form.message?.label
  ) {
    return null
  }

  const cards = (doc.cards ?? []).flatMap((card) => {
    const iconSrc = mediaUrl(card.icon)
    if (!iconSrc) return []
    return [
      {
        label: card.label,
        value: card.value,
        href: card.href,
        iconSrc,
        iconWidth: card.displayWidth,
        iconHeight: card.displayHeight,
      },
    ]
  })

  if (!cards.length) return null

  const formContent: ContactFormContent = {
    successMessage: form.successMessage,
    submitLabel: form.submitLabel,
    countryCode: form.countryCode,
    phoneLabel: form.phoneLabel,
    phonePlaceholder: form.phonePlaceholder,
    countryCodeLabel: form.countryCodeLabel,
    phoneAriaLabel: form.phoneAriaLabel,
    requiredMessage: form.requiredMessage,
    invalidEmailMessage: form.invalidEmailMessage,
    invalidCountryCodeMessage: form.invalidCountryCodeMessage,
    invalidPhoneMessage: form.invalidPhoneMessage,
    firstName: { label: form.firstName.label, placeholder: form.firstName.placeholder },
    lastName: { label: form.lastName.label, placeholder: form.lastName.placeholder },
    company: { label: form.company.label, placeholder: form.company.placeholder },
    email: { label: form.email.label, placeholder: form.email.placeholder },
    message: { label: form.message.label, placeholder: form.message.placeholder },
  }

  return {
    metaTitle: doc.metaTitle,
    metaDescription: doc.metaDescription,
    breadcrumbHomeLabel: doc.breadcrumbHomeLabel,
    breadcrumbHomeHref: doc.breadcrumbHomeHref,
    breadcrumbCurrent: doc.breadcrumbCurrent,
    title: doc.title,
    illustrationSrc: mediaUrl(doc.illustration),
    cards,
    helpTitle: doc.helpTitle,
    form: formContent,
  }
}
