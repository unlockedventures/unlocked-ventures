'use client'

import { ErrorScreen } from '@/components/site/error-screen'
import { dmSans, helveticaNeueLtPro, inter } from './(frontend)/fonts'
import './(frontend)/globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void error
  void reset

  return (
    <html
      lang="en"
      className={`${helveticaNeueLtPro.variable} ${dmSans.variable} ${inter.variable}`}
    >
      <body>
        <title>Something went wrong</title>
        <ErrorScreen
          label="Error"
          title="Something went wrong"
          description="This page could not be loaded."
        />
      </body>
    </html>
  )
}
