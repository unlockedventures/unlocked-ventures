'use client'

import { ErrorScreen } from '@/components/site/error-screen'
import { useErrorContent } from '@/hooks/queries/use-site-queries'

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  void error
  void reset
  const { data: content } = useErrorContent()

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
