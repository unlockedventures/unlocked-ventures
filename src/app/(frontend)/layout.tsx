import type { Metadata } from 'next'
import React from 'react'
import { dmSans, helveticaNeueLtPro, inter } from './fonts'
import './globals.css'
import { AppProviders } from '@/components/providers/app-providers'
import { getSite } from '@/data/get-site'
import { getSiteURL } from '@/lib/site-url'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()

  return {
    metadataBase: new URL(getSiteURL()),
    description: site?.description,
    title: site?.title,
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html
      lang="en"
      className={`${helveticaNeueLtPro.variable} ${dmSans.variable} ${inter.variable}`}
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
