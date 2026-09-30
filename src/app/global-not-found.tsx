import type { Metadata } from 'next'

import { ErrorScreen } from '@/components/site/error-screen'
import { getSite } from '@/data/get-site'

import { dmSans, helveticaNeueLtPro, inter } from './(frontend)/fonts'
import './(frontend)/globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()

  return {
    title: site?.notFoundMetaTitle,
  }
}

export default async function GlobalNotFound() {
  const site = await getSite()

  return (
    <html
      lang="en"
      className={`${helveticaNeueLtPro.variable} ${dmSans.variable} ${inter.variable}`}
    >
      <body>
        {site ? (
          <ErrorScreen
            label={site.notFoundLabel}
            title={site.notFoundTitle}
            description={site.notFoundDescription}
            homeLabel={site.homeButtonLabel}
          />
        ) : null}
      </body>
    </html>
  )
}