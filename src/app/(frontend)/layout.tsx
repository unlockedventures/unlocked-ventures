import type { Metadata } from 'next'
import React from 'react'
import { dmSans, helveticaNeueLtPro, inter } from './fonts'
import './globals.css'
import { getSite } from '@/data/get-site'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()

  return {
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
      <body>{children}</body>
    </html>
  )
}
