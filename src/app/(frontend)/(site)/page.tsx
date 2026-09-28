import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import { Button } from '@/components/ui/button'
import config from '@/payload.config'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex max-w-xl flex-col items-center gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">
          {user ? `Welcome back, ${user.email}` : 'Welcome to your new project.'}
        </h1>
        <p className="text-muted-foreground">
          The public site uses shadcn and Tailwind. The homepage design comes next.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <a href={payloadConfig.routes.admin}>Go to admin panel</a>
        </Button>
        <Button asChild variant="outline">
          <a href="https://payloadcms.com/docs" rel="noopener noreferrer" target="_blank">
            Documentation
          </a>
        </Button>
      </div>
    </div>
  )
}
