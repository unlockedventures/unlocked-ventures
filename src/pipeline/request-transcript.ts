import http from 'node:http'
import https from 'node:https'
import { URL } from 'node:url'

import type { TranscribeResult } from '@/pipeline/run-transcription'

const busyMessage = 'Another transcript is already being generated. Try again when it finishes.'
const requestTimeoutMs = 30 * 60 * 1000

export async function requestTranscript(args: {
  url: string
  endpoint: string
  secret: string
  fetchImpl?: typeof fetch
}): Promise<TranscribeResult> {
  try {
    const { status, body } = args.fetchImpl
      ? await fetchTranscribe(args)
      : await postTranscribe(args)

    if (status === 401) {
      return { ok: false, error: 'The transcriber rejected the request.', stop: true }
    }
    if (status === 409) {
      return { ok: false, error: busyMessage, stop: true, busy: true }
    }

    if (status >= 200 && status < 300 && typeof body?.transcript === 'string') {
      return { ok: true, transcript: body.transcript }
    }
    const error = typeof body?.error === 'string' ? body.error : 'Transcription failed.'
    const stop =
      body?.stop === true ||
      /out of memory|not enough memory|WHISPER_MODEL/i.test(error)
    return { ok: false, error, stop }
  } catch {
    return { ok: false, error: 'The transcriber is unavailable.', stop: true }
  }
}

async function fetchTranscribe(args: {
  url: string
  endpoint: string
  secret: string
  fetchImpl?: typeof fetch
}) {
  const fetchImpl = args.fetchImpl ?? fetch
  const response = await fetchImpl(`${args.endpoint.replace(/\/$/, '')}/transcribe`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: args.url }),
  })
  const body = (await response.json().catch(() => null)) as {
    transcript?: unknown
    error?: unknown
    stop?: unknown
  } | null
  return { status: response.status, body }
}

function postTranscribe(args: { url: string; endpoint: string; secret: string }) {
  const base = args.endpoint.endsWith('/') ? args.endpoint : `${args.endpoint}/`
  const target = new URL('transcribe', base)
  const payload = JSON.stringify({ url: args.url })
  const lib = target.protocol === 'https:' ? https : http

  return new Promise<{
    status: number
    body: { transcript?: unknown; error?: unknown; stop?: unknown } | null
  }>((resolve, reject) => {
    const request = lib.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        path: `${target.pathname}${target.search}`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${args.secret}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (response) => {
        const chunks: Buffer[] = []
        response.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })
        response.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8')
          let body: { transcript?: unknown; error?: unknown; stop?: unknown } | null = null
          try {
            body = JSON.parse(text) as { transcript?: unknown; error?: unknown; stop?: unknown }
          } catch {
            body = null
          }
          resolve({ status: response.statusCode ?? 0, body })
        })
      },
    )

    request.setTimeout(requestTimeoutMs, () => {
      request.destroy(new Error('timeout'))
    })
    request.on('error', reject)
    request.write(payload)
    request.end()
  })
}
