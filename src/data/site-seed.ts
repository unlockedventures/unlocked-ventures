import {
  DEFAULT_CONTACT_EMAIL_BODY,
  DEFAULT_CONTACT_EMAIL_HTML,
  DEFAULT_CONTACT_EMAIL_SUBJECT,
} from '@/lib/contact/email-template'

export const siteSeed = {
  title: 'Unlocked Ventures',
  description: 'Unlocked Ventures',
  notFoundMetaTitle: 'Page not found',
  notFoundLabel: '404',
  notFoundTitle: 'This page is not available',
  notFoundDescription: 'The address may be wrong, or the page may have moved.',
  homeButtonLabel: 'Go home',
  errorMetaTitle: 'Something went wrong',
  errorLabel: 'Error',
  errorTitle: 'Something went wrong',
  errorDescription: 'This page could not be loaded.',
  contactEmailSubject: DEFAULT_CONTACT_EMAIL_SUBJECT,
  contactEmailBody: DEFAULT_CONTACT_EMAIL_BODY,
  contactEmailHtml: DEFAULT_CONTACT_EMAIL_HTML,
}
