import type { AdminViewServerProps } from 'payload'

import { redirect } from 'next/navigation'
import { getSafeRedirect } from 'payload/shared'
import React from 'react'

import { AdminLogo } from '@/components/admin/admin-logo'
import { LoginForm } from '@/components/admin/login-form'

function readRedirect(searchParams: AdminViewServerProps['searchParams']) {
  const value = searchParams?.redirect
  if (Array.isArray(value)) return value[0]
  return value
}

export function LoginView({ initPageResult, searchParams }: AdminViewServerProps) {
  const { req } = initPageResult
  const redirectTo = readRedirect(searchParams)

  if (req.user) {
    redirect(
      getSafeRedirect({
        fallbackTo: req.payload.config.routes.admin,
        redirectTo: redirectTo ?? '',
      }),
    )
  }

  return (
    <>
      <div className="login__brand">
        <AdminLogo />
      </div>
      <LoginForm redirectTo={redirectTo} />
    </>
  )
}
