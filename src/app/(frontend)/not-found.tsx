import type { Metadata } from 'next'

import { ErrorScreen } from '@/components/site/error-screen'

export const metadata: Metadata = {
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <ErrorScreen
      label="404"
      title="This page is not available"
      description="The address may be wrong, or the page may have moved."
    />
  )
}
