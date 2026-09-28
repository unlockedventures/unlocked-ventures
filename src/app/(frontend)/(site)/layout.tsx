import React from 'react'

import { SiteHeader } from '@/components/site/site-header'

export default function SiteLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
    </>
  )
}
