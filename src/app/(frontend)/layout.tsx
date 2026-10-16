import type { Metadata } from 'next'
import React from 'react'
import { dmSans, helveticaNeueLtPro, inter } from './fonts'
import './globals.css'
import { AppProviders } from '@/components/providers/app-providers'
import { getSite } from '@/data/get-site'
import { buildPageMetadata } from '@/lib/seo'
import { getSiteURL } from '@/lib/site-url'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()
  const base = buildPageMetadata({
    title: site?.title,
    description: site?.description,
    path: '/',
    tags: ['home', 'financial consulting', 'technology acceleration'],
  })

  return {
    ...base,
    metadataBase: new URL(getSiteURL()),
    title: {
      default: site?.title || 'Unlocked Ventures',
      template: `%s | ${site?.title || 'Unlocked Ventures'}`,
    },
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
