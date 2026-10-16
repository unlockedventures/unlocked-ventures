import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

import { ContactForm, type ContactFormContent } from '@/components/site/contact/contact-form'
import { useContactStore } from '@/stores/contact-store'

const content: ContactFormContent = {
  successMessage: 'Thank you. We will be in touch.',
  submitLabel: 'Send message',
  countryCode: '+1',
  phoneLabel: 'Phone',
  phonePlaceholder: 'Enter phone number',
  countryCodeLabel: 'Country code',
  phoneAriaLabel: 'Phone number',
  requiredMessage: 'This field is required',
  invalidEmailMessage: 'Enter a valid email address',
  invalidCountryCodeMessage: 'Enter a valid country code',
  invalidPhoneMessage: 'Enter a valid phone number',
  firstName: { label: 'First name *', placeholder: 'First name' },
  lastName: { label: 'Last name *', placeholder: 'Last name' },
  company: { label: 'Company *', placeholder: 'Company' },
  email: { label: 'Email *', placeholder: 'Email' },
  message: { label: 'Message *', placeholder: 'Message' },
}

function fillRequired(
  overrides: Partial<Record<'firstName' | 'lastName' | 'company' | 'email' | 'message', string>> = {},
) {
  const values = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    company: 'Analytical Engines',
    email: 'ada@example.com',
    message: 'Hello',
    ...overrides,
  }

  fireEvent.change(screen.getByRole('textbox', { name: 'First name *' }), {
    target: { value: values.firstName },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Last name *' }), {
    target: { value: values.lastName },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Company *' }), {
    target: { value: values.company },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Email *' }), {
    target: { value: values.email },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Message *' }), {
    target: { value: values.message },
  })
}

describe('ContactForm', () => {
  beforeEach(() => {
    useContactStore.getState().reset()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({ ok: true, id: 1 }, { status: 200 }),
      ) as unknown as typeof fetch,
    )
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it('shows required errors and keeps the form when fields are empty', async () => {
    render(<ContactForm content={content} />)

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findAllByText('This field is required')).toHaveLength(5)
    expect(screen.queryByText('Thank you. We will be in touch.')).not.toBeInTheDocument()
  })

  it('rejects an invalid email and a phone number that is not numeric', async () => {
    render(<ContactForm content={content} />)
    fillRequired({ email: 'not-an-email' })
    fireEvent.change(screen.getByRole('textbox', { name: 'Phone number' }), {
      target: { value: 'abc' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid phone number')).toBeInTheDocument()
    expect(screen.queryByText('Thank you. We will be in touch.')).not.toBeInTheDocument()
  })

  it('accepts a complete form when the phone number is left blank', async () => {
    render(<ContactForm content={content} />)
    fillRequired()

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => {
      expect(screen.getByText('Thank you. We will be in touch.')).toBeInTheDocument()
    })
    expect(fetch).toHaveBeenCalledWith(
      '/api/contact',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})
