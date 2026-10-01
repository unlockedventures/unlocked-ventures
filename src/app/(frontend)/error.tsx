'use client'

import { useEffect, useState } from 'react'

import { ErrorScreen } from '@/components/site/error-screen'
import { getErrorContent } from '@/data/get-error-content'

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void error
  void reset
  const [content, setContent] = useState<Awaited<ReturnType<typeof getErrorContent>>>(null)

  useEffect(() => {
    void getErrorContent().then(setContent)
  }, [])

  if (!content) return null

  return (
    <>
      <title>{content.metaTitle}</title>
      <ErrorScreen
        label={content.label}
        title={content.title}
        description={content.description}
        homeLabel={content.homeLabel}
      />
    </>
  )
}
