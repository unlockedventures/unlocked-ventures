'use client'

import { FieldError, FieldLabel, useField } from '@payloadcms/ui'
import { password } from 'payload/shared'
import React, { useState } from 'react'

export function LoginPasswordField() {
  const [visible, setVisible] = useState(false)
  const { setValue, showError, value } = useField<string>({
    path: 'password',
    validate: (fieldValue, options) =>
      password(fieldValue, { ...(options as Parameters<typeof password>[1]), required: true }),
  })

  return (
    <div className="field-type password">
      <FieldLabel label="Password" path="password" required />
      <div className="field-type__wrap">
        <FieldError path="password" showError={showError} />
        <div className="login-password">
          <input
            id="field-password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            type={visible ? 'text' : 'password'}
            value={value || ''}
            onChange={(event) => setValue(event.target.value)}
          />
          <button
            type="button"
            className="login-password__toggle"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            onClick={() => setVisible((current) => !current)}
          >
            {visible ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 4.5 20.5 20"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.2 6.9A9.8 9.8 0 0 1 12 6.5c6 0 9.5 5.5 9.5 5.5a16 16 0 0 1-3.1 3.4M6.1 8.2C4 9.7 2.5 12 2.5 12S6 17.5 12 17.5c1.2 0 2.3-.2 3.3-.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.1 10.3a2.75 2.75 0 0 0 3.6 3.6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
