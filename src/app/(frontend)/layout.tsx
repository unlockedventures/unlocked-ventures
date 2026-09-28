import React from 'react'
import { SiteHeader } from '@/components/site/site-header'
import { dmSans, helveticaNeueLtPro, inter } from './fonts'
import './globals.css'

export const metadata = {
  description: 'Unlocked Ventures',
  title: 'Unlocked Ventures',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html
      lang="en"
      className={`${helveticaNeueLtPro.variable} ${dmSans.variable} ${inter.variable}`}
    >
      <body>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  )
}
