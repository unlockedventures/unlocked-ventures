import type { Metadata } from 'next'

import { ErrorScreen } from '@/components/site/error-screen'

import { dmSans, helveticaNeueLtPro, inter } from './(frontend)/fonts'
import './(frontend)/globals.css'

export const metadata: Metadata = {
  title: 'Page not found',
}

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${helveticaNeueLtPro.variable} ${dmSans.variable} ${inter.variable}`}
    >
      <body>
        <ErrorScreen
          label="404"
          title="This page is not available"
          description="The address may be wrong, or the page may have moved."
        />
      </body>
    </html>
  )
}
