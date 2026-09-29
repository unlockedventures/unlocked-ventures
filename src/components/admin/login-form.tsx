'use client'

import { EmailField, Form, FormSubmit, Link, TextField, useAuth, useConfig, useTranslation } from '@payloadcms/ui'
import { email, formatAdminURL, getLoginOptions, getSafeRedirect, username } from 'payload/shared'
import React, { useState } from 'react'

import { LoginPasswordField } from '@/components/admin/login-password-field'

type LoginFormProps = {
  redirectTo?: string
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const { config, getEntityConfig } = useConfig()
  const { setUser } = useAuth()
  const { t } = useTranslation()
  const userSlug = config.admin.user
  const collectionConfig = getEntityConfig({ collectionSlug: userSlug })
  const loginWithUsername = collectionConfig?.auth?.loginWithUsername
  const { canLoginWithEmail, canLoginWithUsername } = getLoginOptions(loginWithUsername ?? false)
  const [loginType] = useState(() => {
    if (canLoginWithEmail && canLoginWithUsername) return 'emailOrUsername' as const
    if (canLoginWithUsername) return 'username' as const
    return 'email' as const
  })

  const autoLogin = typeof config.admin.autoLogin === 'object' ? config.admin.autoLogin : undefined
  const prefill = Boolean(autoLogin?.prefillOnly)
  const prefillEmail = prefill ? autoLogin?.email : undefined
  const prefillPassword = prefill ? autoLogin?.password : undefined
  const prefillUsername = prefill ? autoLogin?.username : undefined

  const initialState = {
    password: {
      initialValue: prefillPassword,
      valid: true,
      value: prefillPassword,
    },
    ...(loginWithUsername
      ? {
          username: {
            initialValue: prefillUsername,
            valid: true,
            value: prefillUsername,
          },
        }
      : {
          email: {
            initialValue: prefillEmail,
            valid: true,
            value: prefillEmail,
          },
        }),
  }

  return (
    <Form
      action={formatAdminURL({
        apiRoute: config.routes.api,
        path: `/${userSlug}/login`,
      })}
      className="login__form"
      disableSuccessStatus
      initialState={initialState}
      method="POST"
      onSuccess={(data) => {
        setUser(data as Parameters<typeof setUser>[0])
      }}
      redirect={getSafeRedirect({
        fallbackTo: config.routes.admin,
        redirectTo: redirectTo ?? '',
      })}
      waitForAutocomplete
    >
      <div className="login__form__inputWrap">
        {loginType === 'email' ? (
          <EmailField
            path="email"
            validate={email}
            field={{
              name: 'email',
              label: t('general:email'),
              required: true,
              admin: {
                autoComplete: 'email',
                placeholder: 'Enter your email',
              },
            }}
          />
        ) : null}
        {loginType === 'username' ? (
          <TextField
            path="username"
            validate={username}
            field={{
              name: 'username',
              label: t('authentication:username'),
              required: true,
              admin: {
                placeholder: 'Enter your username',
              },
            }}
          />
        ) : null}
        {loginType === 'emailOrUsername' ? (
          <TextField
            path="username"
            validate={(value, options) => {
              const passesUsername = username(value, options)
              const passesEmail = email(value, options as unknown as Parameters<typeof email>[1])
              if (!passesEmail && !passesUsername) {
                return `${t('general:email')}: ${passesEmail} ${t('general:username')}: ${passesUsername}`
              }
              return true
            }}
            field={{
              name: 'username',
              label: t('authentication:emailOrUsername'),
              required: true,
              admin: {
                placeholder: 'Enter your email or username',
              },
            }}
          />
        ) : null}
        <LoginPasswordField />
      </div>
      <Link
        href={formatAdminURL({
          adminRoute: config.routes.admin,
          path: config.admin.routes.forgot,
        })}
        prefetch={false}
      >
        {t('authentication:forgotPasswordQuestion')}
      </Link>
      <FormSubmit size="large">{t('authentication:login')}</FormSubmit>
    </Form>
  )
}
