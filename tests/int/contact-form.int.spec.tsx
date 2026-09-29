import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}))

import { ContactForm } from '@/components/site/contact/contact-form'

function fillRequired(overrides: Partial<Record<'firstName' | 'lastName' | 'company' | 'email' | 'message', string>> = {}) {
  const values = {
    firstName: 'Ada',
    lastName: 'Lovelace',
    company: 'Analytical Engines',
    email: 'ada@example.com',
    message: 'Hello',
    ...overrides,
  }

  fireEvent.change(screen.getByRole('textbox', { name: 'First name *' }), { target: { value: values.firstName } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Last name *' }), { target: { value: values.lastName } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Company *' }), { target: { value: values.company } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Email *' }), { target: { value: values.email } })
  fireEvent.change(screen.getByRole('textbox', { name: 'Message *' }), { target: { value: values.message } })
}

describe('ContactForm', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows required errors and keeps the form when fields are empty', async () => {
    render(<ContactForm />)

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findAllByText('This field is required')).toHaveLength(5)
    expect(screen.queryByText('Thank you. We will be in touch.')).not.toBeInTheDocument()
  })

  it('rejects an invalid email and a phone number that is not numeric', async () => {
    render(<ContactForm />)
    fillRequired({ email: 'not-an-email' })
    fireEvent.change(screen.getByRole('textbox', { name: 'Phone number' }), { target: { value: 'abc' } })

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid phone number')).toBeInTheDocument()
    expect(screen.queryByText('Thank you. We will be in touch.')).not.toBeInTheDocument()
  })

  it('accepts a complete form when the phone number is left blank', async () => {
    render(<ContactForm />)
    fillRequired()

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(await screen.findByText('Thank you. We will be in touch.')).toBeInTheDocument()
  })
})
