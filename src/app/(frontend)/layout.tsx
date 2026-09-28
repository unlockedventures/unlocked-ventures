import React from 'react'
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
      <body>{children}</body>
    </html>
  )
}
