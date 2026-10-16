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
