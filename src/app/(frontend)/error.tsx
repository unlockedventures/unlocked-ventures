'use client'

import { ErrorScreen } from '@/components/site/error-screen'

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void error
  void reset

  return (
    <>
      <title>Something went wrong</title>
      <ErrorScreen
        label="Error"
        title="Something went wrong"
        description="This page could not be loaded."
      />
    </>
  )
}
