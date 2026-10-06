import type { TranscribeResult } from '@/pipeline/run-transcription'

const busyMessage = 'Another transcript is already being generated. Try again when it finishes.'

export async function requestTranscript(args: {
  url: string
  endpoint: string
  secret: string
  fetchImpl?: typeof fetch
}): Promise<TranscribeResult> {
  const fetchImpl = args.fetchImpl ?? fetch
  try {
    const response = await fetchImpl(`${args.endpoint.replace(/\/$/, '')}/transcribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${args.secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: args.url }),
    })

    if (response.status === 401) {
      return { ok: false, error: 'The transcriber rejected the request.', stop: true }
    }
    if (response.status === 409) {
      return { ok: false, error: busyMessage, stop: true, busy: true }
    }

    const body = (await response.json().catch(() => null)) as { transcript?: unknown; error?: unknown } | null
    if (response.ok && typeof body?.transcript === 'string') {
      return { ok: true, transcript: body.transcript }
    }
    return {
      ok: false,
      error: typeof body?.error === 'string' ? body.error : 'Transcription failed.',
      stop: false,
    }
  } catch {
    return { ok: false, error: 'The transcriber is unavailable.', stop: true }
  }
}
