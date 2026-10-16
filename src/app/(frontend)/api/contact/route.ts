import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import config from '@payload-config'

import {
  parseContactSubmission,
  submitContactMessage,
} from '@/lib/contact/submit-contact-message'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = parseContactSubmission(body)
  if ('ok' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status })
  }

  const payload = await getPayload({ config })
  const result = await submitContactMessage(payload, parsed)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ ok: true, id: result.id })
}
