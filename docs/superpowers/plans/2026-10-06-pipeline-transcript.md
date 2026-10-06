# Pipeline Transcript Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Pipeline collection whose Generate Transcript button fills a transcript field from one or more public video links.

**Architecture:** The admin app validates links and writes the Pipeline document. A private Docker transcriber downloads audio with yt-dlp, converts it with ffmpeg, transcribes it with Whisper `turbo`, and deletes its temp directory before responding. The screen polls the saved document every 3 seconds.

**Tech Stack:** Payload 3.90, Next.js 16, Vitest, Python 3.11 stdlib HTTP server, yt-dlp, ffmpeg, openai-whisper.

## Global Constraints

- Whisper model is `turbo`. Task is `transcribe`. Language is detected from the audio. Do not translate speech into English.
- Each video is stopped at 30 minutes. The limit covers download, conversion, and transcription.
- Downloaded video and extracted audio live only in a temp directory, deleted after success, failure, and timeout.
- The Next.js app and the transcriber are separate Docker services. The website container does not run Whisper.
- The transcriber handles one video at a time and has no host port.
- Temp audio is 16 kHz mono wav.
- A new run clears `transcript` before the first video, then appends one block per link.
- A failed link keeps blocks already written in that run, then the run continues with the next link.
- A second Pipeline document does not start while one is processing, and its saved fields stay unchanged.
- Create, read, update, and delete on `pipeline` require a logged-in editor.
- Automated tests do not load Whisper `turbo`.

## File structure

- `src/pipeline/video-url.ts` — accept or reject the link list.
- `src/pipeline/transcript.ts` — build the transcript text.
- `src/pipeline/run-transcription.ts` — decide status codes and when to save.
- `src/pipeline/request-transcript.ts` — call the transcriber.
- `src/pipeline/button-state.ts` — decide whether Generate Transcript is disabled.
- `src/collections/Pipeline.ts` — Payload collection and `POST /api/pipeline/transcribe`.
- `src/components/admin/generate-transcript-field.tsx` — the button and polling.
- `transcriber/transcribe.py` — yt-dlp, ffmpeg, Whisper, and temp-directory cleanup.
- `transcriber/server.py` — private HTTP API.
- `transcriber/Dockerfile` — ffmpeg, yt-dlp, and openai-whisper.
- Modify `src/payload.config.ts`, `src/admin/editor-guide.ts`, `docker-compose.yml`, and `.env.example`.

---

### Task 1: Video link validation

**Files:**
- Create: `src/pipeline/video-url.ts`
- Test: `tests/int/pipeline-video-url.int.spec.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `validateVideoLinks(links: { url?: string | null }[] | null | undefined): { ok: true; urls: string[] } | { ok: false; message: string }`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'

import { validateVideoLinks } from '@/pipeline/video-url'

describe('validateVideoLinks', () => {
  it('rejects an empty list', () => {
    expect(validateVideoLinks([])).toEqual({ ok: false, message: 'Add at least one video link.' })
    expect(validateVideoLinks(null)).toEqual({ ok: false, message: 'Add at least one video link.' })
  })

  it('rejects a blank row and names that row', () => {
    expect(validateVideoLinks([{ url: 'https://www.youtube.com/watch?v=abcdefghijk' }, { url: '  ' }])).toEqual({
      ok: false,
      message: 'Video link 2 is empty.',
    })
  })

  it('rejects a link that is not http or https', () => {
    expect(validateVideoLinks([{ url: 'ftp://example.com/video' }])).toEqual({
      ok: false,
      message: 'Video link 1 must start with http:// or https://.',
    })
  })

  it('accepts YouTube, Vimeo, and Bilibili links', () => {
    expect(
      validateVideoLinks([
        { url: 'https://www.youtube.com/watch?v=abcdefghijk' },
        { url: 'https://vimeo.com/123456789' },
        { url: 'https://www.bilibili.com/video/BV1xx411c7mD' },
      ]),
    ).toEqual({
      ok: true,
      urls: [
        'https://www.youtube.com/watch?v=abcdefghijk',
        'https://vimeo.com/123456789',
        'https://www.bilibili.com/video/BV1xx411c7mD',
      ],
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/pipeline-video-url.int.spec.ts`

Expected: FAIL because `@/pipeline/video-url` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
export type VideoLink = {
  url?: string | null
}

export type VideoUrlResult = { ok: true; urls: string[] } | { ok: false; message: string }

export function validateVideoLinks(links: VideoLink[] | null | undefined): VideoUrlResult {
  if (!links || links.length === 0) {
    return { ok: false, message: 'Add at least one video link.' }
  }

  const urls: string[] = []
  for (let index = 0; index < links.length; index += 1) {
    const raw = links[index]?.url?.trim() ?? ''
    if (!raw) return { ok: false, message: `Video link ${index + 1} is empty.` }

    try {
      const parsed = new URL(raw)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { ok: false, message: `Video link ${index + 1} must start with http:// or https://.` }
      }
    } catch {
      return { ok: false, message: `Video link ${index + 1} must start with http:// or https://.` }
    }

    urls.push(raw)
  }

  return { ok: true, urls }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/pipeline-video-url.int.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pipeline/video-url.ts tests/int/pipeline-video-url.int.spec.ts
git commit -m "$(cat <<'EOF'
feat: validate Pipeline video links

Reject empty rows and non-http links before a transcript run starts.
EOF
)"
```

---

### Task 2: Transcript text

**Files:**
- Create: `src/pipeline/transcript.ts`
- Test: `tests/int/pipeline-transcript.int.spec.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `appendTranscript(current: string, url: string, body: string): string`
  - `failureBody(reason: string): string`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'

import { appendTranscript, failureBody } from '@/pipeline/transcript'

describe('appendTranscript', () => {
  it('writes the first block with the video URL as a heading', () => {
    expect(appendTranscript('', 'https://vimeo.com/123456789', 'Hello there')).toBe(
      '## https://vimeo.com/123456789\n\nHello there',
    )
  })

  it('keeps the earlier block when a later video fails', () => {
    const first = appendTranscript('', 'https://www.youtube.com/watch?v=abcdefghijk', 'First video')
    const second = appendTranscript(first, 'https://www.bilibili.com/video/BV1xx411c7mD', failureBody('Video unavailable'))
    expect(second).toBe(
      [
        '## https://www.youtube.com/watch?v=abcdefghijk',
        '',
        'First video',
        '',
        '## https://www.bilibili.com/video/BV1xx411c7mD',
        '',
        'Could not transcribe this video: Video unavailable',
      ].join('\n'),
    )
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/pipeline-transcript.int.spec.ts`

Expected: FAIL because `@/pipeline/transcript` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
export function failureBody(reason: string) {
  return `Could not transcribe this video: ${reason}`
}

export function appendTranscript(current: string, url: string, body: string) {
  const block = `## ${url}\n\n${body.trim()}`
  const trimmed = current.trim()
  return trimmed ? `${trimmed}\n\n${block}` : block
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/pipeline-transcript.int.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pipeline/transcript.ts tests/int/pipeline-transcript.int.spec.ts
git commit -m "$(cat <<'EOF'
feat: format Pipeline transcript blocks

Keep each video under its URL and preserve earlier text when a later video fails.
EOF
)"
```

---

### Task 3: Transcription run

**Files:**
- Create: `src/pipeline/run-transcription.ts`
- Test: `tests/int/pipeline-run.int.spec.ts`

**Interfaces:**
- Consumes: `validateVideoLinks`, `appendTranscript`, `failureBody`
- Produces:
  - `type PipelineStatus = 'idle' | 'processing' | 'ready' | 'error'`
  - `type PipelineDoc = { id: number | string; videoLinks?: { url?: string | null }[] | null; transcript?: string | null; status?: PipelineStatus | null; statusMessage?: string | null }`
  - `type PipelinePatch = { transcript: string; status: PipelineStatus; statusMessage: string }`
  - `type TranscribeResult = { ok: true; transcript: string } | { ok: false; error: string; stop: boolean; busy?: boolean }`
  - `type RunResult = { status: number; body: { error: string } | { status: PipelineStatus } }`
  - `handleTranscribeRequest(args: { user: unknown; doc: PipelineDoc | null; otherProcessing: boolean; save: (data: PipelinePatch) => Promise<void>; transcribe: (url: string) => Promise<TranscribeResult> }): Promise<RunResult>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'

import { handleTranscribeRequest, type PipelineDoc, type PipelinePatch, type TranscribeResult } from '@/pipeline/run-transcription'

const doc: PipelineDoc = {
  id: 7,
  videoLinks: [{ url: 'https://www.youtube.com/watch?v=abcdefghijk' }, { url: 'https://vimeo.com/123456789' }],
  transcript: 'old transcript',
  status: 'ready',
  statusMessage: '',
}

function harness(transcribe: (url: string) => Promise<TranscribeResult>, overrides: Partial<Parameters<typeof handleTranscribeRequest>[0]> = {}) {
  const saves: PipelinePatch[] = []
  const promise = handleTranscribeRequest({
    user: { id: 1 },
    doc,
    otherProcessing: false,
    save: async (data) => {
      saves.push(data)
    },
    transcribe,
    ...overrides,
  })
  return { promise, saves }
}

describe('handleTranscribeRequest', () => {
  it('returns 401 when no editor is logged in and does not save', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), { user: null })
    await expect(promise).resolves.toEqual({ status: 401, body: { error: 'Unauthorized' } })
    expect(saves).toEqual([])
  })

  it('returns 404 when the document is missing', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), { doc: null })
    await expect(promise).resolves.toEqual({ status: 404, body: { error: 'Pipeline document not found.' } })
    expect(saves).toEqual([])
  })

  it('returns 409 when this document is already processing', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), {
      doc: { ...doc, status: 'processing' },
    })
    await expect(promise).resolves.toEqual({ status: 409, body: { error: 'This transcript is already being generated.' } })
    expect(saves).toEqual([])
  })

  it('returns 409 when another document is processing and leaves this document unchanged', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), { otherProcessing: true })
    await expect(promise).resolves.toEqual({
      status: 409,
      body: { error: 'Another transcript is already being generated. Try again when it finishes.' },
    })
    expect(saves).toEqual([])
  })

  it('returns 400 and names the bad row', async () => {
    const { promise, saves } = harness(async () => ({ ok: true, transcript: 'nope' }), {
      doc: { ...doc, videoLinks: [{ url: '' }] },
    })
    await expect(promise).resolves.toEqual({ status: 400, body: { error: 'Video link 1 is empty.' } })
    expect(saves).toEqual([])
  })

  it('appends each transcript and finishes ready', async () => {
    const { promise, saves } = harness(async (url) => ({ ok: true, transcript: `text for ${url}` }))
    await expect(promise).resolves.toEqual({ status: 200, body: { status: 'ready' } })
    expect(saves.at(-1)).toEqual({
      status: 'ready',
      statusMessage: '',
      transcript: [
        '## https://www.youtube.com/watch?v=abcdefghijk',
        '',
        'text for https://www.youtube.com/watch?v=abcdefghijk',
        '',
        '## https://vimeo.com/123456789',
        '',
        'text for https://vimeo.com/123456789',
      ].join('\n'),
    })
  })

  it('keeps the first transcript when the second video fails', async () => {
    const { promise, saves } = harness(async (url) => {
      if (url.includes('vimeo')) return { ok: false, error: 'Video unavailable', stop: false }
      return { ok: true, transcript: 'First video' }
    })
    await expect(promise).resolves.toEqual({ status: 200, body: { status: 'error' } })
    expect(saves.at(-1)?.status).toBe('error')
    expect(saves.at(-1)?.statusMessage).toBe('Some videos could not be transcribed.')
    expect(saves.at(-1)?.transcript).toContain('First video')
    expect(saves.at(-1)?.transcript).toContain('Could not transcribe this video: Video unavailable')
  })

  it('stops the loop when the transcriber is unavailable and keeps finished blocks', async () => {
    const { promise, saves } = harness(async (url) => {
      if (url.includes('vimeo')) return { ok: false, error: 'The transcriber is unavailable.', stop: true }
      return { ok: true, transcript: 'First video' }
    })
    await expect(promise).resolves.toEqual({ status: 200, body: { status: 'error' } })
    expect(saves.at(-1)).toMatchObject({
      status: 'error',
      statusMessage: 'The transcriber is unavailable.',
    })
    expect(saves.at(-1)?.transcript).toContain('First video')
    expect(saves.at(-1)?.transcript).not.toContain('vimeo.com')
  })

  it('restores the previous transcript when the transcriber is busy before any block is written', async () => {
    const { promise, saves } = harness(async () => ({
      ok: false,
      error: 'Another transcript is already being generated. Try again when it finishes.',
      stop: true,
      busy: true,
    }))
    await expect(promise).resolves.toEqual({
      status: 409,
      body: { error: 'Another transcript is already being generated. Try again when it finishes.' },
    })
    expect(saves.at(-1)).toEqual({
      transcript: 'old transcript',
      status: 'ready',
      statusMessage: '',
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/pipeline-run.int.spec.ts`

Expected: FAIL because `@/pipeline/run-transcription` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
import { appendTranscript, failureBody } from '@/pipeline/transcript'
import { validateVideoLinks } from '@/pipeline/video-url'

export type PipelineStatus = 'idle' | 'processing' | 'ready' | 'error'

export type PipelineDoc = {
  id: number | string
  videoLinks?: { url?: string | null }[] | null
  transcript?: string | null
  status?: PipelineStatus | null
  statusMessage?: string | null
}

export type PipelinePatch = {
  transcript: string
  status: PipelineStatus
  statusMessage: string
}

export type TranscribeResult =
  | { ok: true; transcript: string }
  | { ok: false; error: string; stop: boolean; busy?: boolean }

export type RunResult = {
  status: number
  body: { error: string } | { status: PipelineStatus }
}

const busyMessage = 'Another transcript is already being generated. Try again when it finishes.'

export async function handleTranscribeRequest(args: {
  user: unknown
  doc: PipelineDoc | null
  otherProcessing: boolean
  save: (data: PipelinePatch) => Promise<void>
  transcribe: (url: string) => Promise<TranscribeResult>
}): Promise<RunResult> {
  if (!args.user) return { status: 401, body: { error: 'Unauthorized' } }
  if (!args.doc) return { status: 404, body: { error: 'Pipeline document not found.' } }
  if (args.doc.status === 'processing') {
    return { status: 409, body: { error: 'This transcript is already being generated.' } }
  }
  if (args.otherProcessing) return { status: 409, body: { error: busyMessage } }

  const links = validateVideoLinks(args.doc.videoLinks)
  if (!links.ok) return { status: 400, body: { error: links.message } }

  let transcript = ''
  let failed = false
  for (let index = 0; index < links.urls.length; index += 1) {
    const url = links.urls[index]
    await args.save({
      transcript,
      status: 'processing',
      statusMessage: `Generating transcript for video ${index + 1} of ${links.urls.length}.`,
    })

    const result = await args.transcribe(url)
    if (result.ok) {
      transcript = appendTranscript(transcript, url, result.transcript)
      continue
    }

    if (result.busy && transcript === '') {
      await args.save({
        transcript: args.doc.transcript ?? '',
        status: args.doc.status ?? 'idle',
        statusMessage: args.doc.statusMessage ?? '',
      })
      return { status: 409, body: { error: busyMessage } }
    }

    if (result.stop) {
      await args.save({ transcript, status: 'error', statusMessage: result.error })
      return { status: 200, body: { status: 'error' } }
    }

    failed = true
    transcript = appendTranscript(transcript, url, failureBody(result.error))
  }

  await args.save({
    transcript,
    status: failed ? 'error' : 'ready',
    statusMessage: failed ? 'Some videos could not be transcribed.' : '',
  })
  return { status: 200, body: { status: failed ? 'error' : 'ready' } }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/pipeline-run.int.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pipeline/run-transcription.ts tests/int/pipeline-run.int.spec.ts
git commit -m "$(cat <<'EOF'
feat: orchestrate Pipeline transcript runs

Save each video as it finishes and leave other documents unchanged when the transcriber is busy.
EOF
)"
```

---

### Task 4: Transcriber HTTP client

**Files:**
- Create: `src/pipeline/request-transcript.ts`
- Test: `tests/int/pipeline-request.int.spec.ts`

**Interfaces:**
- Consumes: `TranscribeResult` from `src/pipeline/run-transcription.ts`
- Produces: `requestTranscript(args: { url: string; endpoint: string; secret: string; fetchImpl?: typeof fetch }): Promise<TranscribeResult>`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'

import { requestTranscript } from '@/pipeline/request-transcript'

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

describe('requestTranscript', () => {
  it('returns the transcript on success', async () => {
    const result = await requestTranscript({
      url: 'https://vimeo.com/123456789',
      endpoint: 'http://transcriber:8080',
      secret: 'secret',
      fetchImpl: async (input, init) => {
        expect(String(input)).toBe('http://transcriber:8080/transcribe')
        expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer secret')
        return jsonResponse(200, { transcript: 'Hello' })
      },
    })
    expect(result).toEqual({ ok: true, transcript: 'Hello' })
  })

  it('stops the run when the secret is rejected', async () => {
    const result = await requestTranscript({
      url: 'https://vimeo.com/123456789',
      endpoint: 'http://transcriber:8080',
      secret: 'wrong',
      fetchImpl: async () => jsonResponse(401, { error: 'Unauthorized' }),
    })
    expect(result).toEqual({ ok: false, error: 'The transcriber rejected the request.', stop: true })
  })

  it('marks a busy transcriber so the caller can restore the document', async () => {
    const result = await requestTranscript({
      url: 'https://vimeo.com/123456789',
      endpoint: 'http://transcriber:8080',
      secret: 'secret',
      fetchImpl: async () => jsonResponse(409, { error: 'busy' }),
    })
    expect(result).toEqual({
      ok: false,
      error: 'Another transcript is already being generated. Try again when it finishes.',
      stop: true,
      busy: true,
    })
  })

  it('continues the run when one video cannot be transcribed', async () => {
    const result = await requestTranscript({
      url: 'https://vimeo.com/123456789',
      endpoint: 'http://transcriber:8080',
      secret: 'secret',
      fetchImpl: async () => jsonResponse(422, { error: 'Video unavailable' }),
    })
    expect(result).toEqual({ ok: false, error: 'Video unavailable', stop: false })
  })

  it('stops the run when the transcriber cannot be reached', async () => {
    const result = await requestTranscript({
      url: 'https://vimeo.com/123456789',
      endpoint: 'http://transcriber:8080',
      secret: 'secret',
      fetchImpl: async () => {
        throw new Error('connect ECONNREFUSED')
      },
    })
    expect(result).toEqual({ ok: false, error: 'The transcriber is unavailable.', stop: true })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/pipeline-request.int.spec.ts`

Expected: FAIL because `@/pipeline/request-transcript` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/pipeline-request.int.spec.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pipeline/request-transcript.ts tests/int/pipeline-request.int.spec.ts
git commit -m "$(cat <<'EOF'
feat: call the private transcript service

Map auth failures and outages to a stopped run, and a single bad video to a continued run.
EOF
)"
```

---

### Task 5: Pipeline collection and endpoint

**Files:**
- Create: `src/collections/Pipeline.ts`
- Create: `src/components/admin/generate-transcript-field.tsx` (stub, replaced in Task 6)
- Modify: `src/admin/editor-guide.ts`
- Modify: `src/payload.config.ts`
- Modify: `src/app/(payload)/admin/importMap.js` by running the generator
- Test: `pnpm exec tsc --noEmit --pretty false` after generating types

**Interfaces:**
- Consumes: `handleTranscribeRequest`, `requestTranscript`, `PipelineDoc`
- Produces: Payload collection slug `pipeline` and `POST /api/pipeline/transcribe` with JSON body `{ "id": "<document id>" }`

- [ ] **Step 1: Add the admin group**

In `src/admin/editor-guide.ts`, add `pipeline: 'Pipeline'` to `adminGroups`. Insert `adminGroups.pipeline` in `adminGroupOrder` after `adminGroups.news`. Add `'pipeline'` to `adminSlugOrder` after `'news-posts'`.

- [ ] **Step 2: Add the collection**

```ts
import type { CollectionConfig, Endpoint } from 'payload'

import { adminGroups } from '@/admin/editor-guide'
import { requestTranscript } from '@/pipeline/request-transcript'
import { handleTranscribeRequest, type PipelineDoc } from '@/pipeline/run-transcription'

const transcribeEndpoint: Endpoint = {
  path: '/transcribe',
  method: 'post',
  handler: async (req) => {
    if (!req.user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const body = (await req.json().catch(() => null)) as { id?: number | string } | null
    const id = body?.id
    if (id == null || id === '') {
      return Response.json({ error: 'Pipeline document not found.' }, { status: 404 })
    }

    const doc = await req.payload
      .findByID({ collection: 'pipeline', id, depth: 0, req })
      .catch(() => null)
    const others = await req.payload.find({
      collection: 'pipeline',
      depth: 0,
      limit: 1,
      req,
      where: { and: [{ status: { equals: 'processing' } }, { id: { not_equals: id } }] },
    })

    const result = await handleTranscribeRequest({
      user: req.user,
      doc: doc as PipelineDoc | null,
      otherProcessing: others.totalDocs > 0,
      save: async (data) => {
        await req.payload.update({ collection: 'pipeline', id, data, depth: 0, req })
      },
      transcribe: (url) =>
        requestTranscript({
          url,
          endpoint: process.env.TRANSCRIBER_URL ?? '',
          secret: process.env.TRANSCRIBER_SECRET ?? '',
        }),
    })

    return Response.json(result.body, { status: result.status })
  },
}

export const Pipeline: CollectionConfig = {
  slug: 'pipeline',
  labels: { singular: 'Pipeline', plural: 'Pipeline' },
  admin: {
    group: adminGroups.pipeline,
    description: 'Paste public video links and generate a transcript.',
    hideAPIURL: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'status'],
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  endpoints: [transcribeEndpoint],
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'videoLinks',
      type: 'array',
      label: 'Video links',
      labels: { singular: 'Video link', plural: 'Video links' },
      fields: [
        {
          name: 'url',
          type: 'text',
          label: 'Video link',
          admin: {
            description: 'A public video address, such as YouTube, Vimeo, or Bilibili.',
          },
        },
      ],
    },
    {
      name: 'generateTranscript',
      type: 'ui',
      admin: {
        components: {
          Field: '@/components/admin/generate-transcript-field#GenerateTranscriptField',
        },
      },
    },
    {
      name: 'transcript',
      type: 'textarea',
      label: 'Transcript',
      admin: { description: 'Generated text. You can edit it before saving.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'idle',
      options: [
        { label: 'Idle', value: 'idle' },
        { label: 'Processing', value: 'processing' },
        { label: 'Ready', value: 'ready' },
        { label: 'Error', value: 'error' },
      ],
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'statusMessage',
      type: 'text',
      label: 'Status detail',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
```

- [ ] **Step 3: Register the collection**

In `src/payload.config.ts`, import `Pipeline` from `./collections/Pipeline` and add it to the `collections` array.

- [ ] **Step 4: Add a stub field so the admin import map can resolve**

```tsx
'use client'

export function GenerateTranscriptField() {
  return null
}
```

- [ ] **Step 5: Generate Payload types and the admin import map**

Run: `pnpm generate:types`

Expected: `src/payload-types.ts` includes the `pipeline` collection. Do not hand-edit that file.

Run: `pnpm generate:importmap`

Expected: `src/app/(payload)/admin/importMap.js` imports `GenerateTranscriptField`.

- [ ] **Step 6: Typecheck**

Run: `pnpm exec tsc --noEmit --pretty false`

Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/collections/Pipeline.ts src/components/admin/generate-transcript-field.tsx src/admin/editor-guide.ts src/payload.config.ts src/payload-types.ts src/app/\(payload\)/admin/importMap.js
git commit -m "$(cat <<'EOF'
feat: add the Pipeline collection

Store video links and transcripts for logged-in editors, and expose the transcribe endpoint.
EOF
)"
```

---

### Task 6: Generate Transcript button

**Files:**
- Create: `src/pipeline/button-state.ts`
- Modify: `src/components/admin/generate-transcript-field.tsx`
- Modify: `src/app/(payload)/admin/importMap.js` by running the generator
- Test: `tests/int/pipeline-button.int.spec.ts`

**Interfaces:**
- Consumes: collection field `generateTranscript` and `POST /api/pipeline/transcribe`
- Produces: `transcriptButtonState(args: { saved: boolean; status: string | null | undefined }): { disabled: boolean; hint: string | null }`
- Produces: React component `GenerateTranscriptField`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'

import { transcriptButtonState } from '@/pipeline/button-state'

describe('transcriptButtonState', () => {
  it('asks for a save before the document has an id', () => {
    expect(transcriptButtonState({ saved: false, status: 'idle' })).toEqual({
      disabled: true,
      hint: 'Save this Pipeline document before generating a transcript.',
    })
  })

  it('disables the button while a run is in progress', () => {
    expect(transcriptButtonState({ saved: true, status: 'processing' })).toEqual({
      disabled: true,
      hint: null,
    })
  })

  it('enables the button for a saved idle document', () => {
    expect(transcriptButtonState({ saved: true, status: 'idle' })).toEqual({
      disabled: false,
      hint: null,
    })
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/pipeline-button.int.spec.ts`

Expected: FAIL because `@/pipeline/button-state` does not exist.

- [ ] **Step 3: Write the button state helper**

```ts
export function transcriptButtonState(args: { saved: boolean; status: string | null | undefined }) {
  if (!args.saved) {
    return {
      disabled: true,
      hint: 'Save this Pipeline document before generating a transcript.',
    }
  }
  if (args.status === 'processing') return { disabled: true, hint: null }
  return { disabled: false, hint: null }
}
```

- [ ] **Step 4: Write the field component**

```tsx
'use client'

import { Button, useAllFormFields, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import { transcriptButtonState } from '@/pipeline/button-state'

type PipelineResponse = {
  transcript?: string | null
  status?: string | null
  statusMessage?: string | null
  error?: string
}

function fieldText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

export function GenerateTranscriptField() {
  const { id } = useDocumentInfo()
  const [fields, dispatchFields] = useAllFormFields()
  const [watching, setWatching] = useState(false)
  const [localMessage, setLocalMessage] = useState<string | null>(null)
  const status = fieldText(fields.status?.value) || 'idle'
  const statusMessage = fieldText(fields.statusMessage?.value)
  const button = transcriptButtonState({ saved: id != null && id !== '', status })

  useEffect(() => {
    if (status === 'processing') setWatching(true)
  }, [status])

  useEffect(() => {
    if (!watching || id == null || id === '') return
    let cancelled = false

    async function pull() {
      const response = await fetch(`/api/pipeline/${id}?depth=0`, { credentials: 'include' })
      if (!response.ok || cancelled) return
      const doc = (await response.json()) as PipelineResponse
      dispatchFields({ type: 'UPDATE', path: 'transcript', value: doc.transcript ?? '' })
      dispatchFields({ type: 'UPDATE', path: 'status', value: doc.status ?? 'idle' })
      dispatchFields({ type: 'UPDATE', path: 'statusMessage', value: doc.statusMessage ?? '' })
      if (doc.status === 'ready' || doc.status === 'error') setWatching(false)
    }

    void pull()
    const timer = setInterval(() => void pull(), 3000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [dispatchFields, id, watching])

  async function onGenerate() {
    if (button.disabled || id == null) return
    setLocalMessage(null)
    setWatching(true)
    const response = await fetch('/api/pipeline/transcribe', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const body = (await response.json().catch(() => null)) as PipelineResponse | null
    if (!response.ok) {
      setWatching(false)
      setLocalMessage(body?.error ?? 'Could not generate a transcript.')
    }
  }

  const detail = localMessage || button.hint || statusMessage

  return (
    <div className="field-type ui">
      <Button buttonStyle="primary" disabled={button.disabled} onClick={() => void onGenerate()}>
        Generate Transcript
      </Button>
      {detail ? <p>{detail}</p> : null}
    </div>
  )
}
```

- [ ] **Step 5: Generate the admin import map and typecheck**

Run: `pnpm generate:importmap`

Expected: `src/app/(payload)/admin/importMap.js` imports `GenerateTranscriptField`.

Run: `pnpm exec tsc --noEmit --pretty false`

Expected: exit 0.

Run: `pnpm exec vitest run --config ./vitest.config.mts tests/int/pipeline-button.int.spec.ts tests/int/pipeline-video-url.int.spec.ts tests/int/pipeline-transcript.int.spec.ts tests/int/pipeline-run.int.spec.ts tests/int/pipeline-request.int.spec.ts`

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/pipeline/button-state.ts src/components/admin/generate-transcript-field.tsx src/app/\(payload\)/admin/importMap.js tests/int/pipeline-button.int.spec.ts
git commit -m "$(cat <<'EOF'
feat: add the Generate Transcript button

Show progress from the saved Pipeline document while a transcript run is in flight.
EOF
)"
```

---

### Task 7: Transcriber process

**Files:**
- Create: `transcriber/transcribe.py`
- Create: `transcriber/server.py`
- Create: `transcriber/test_transcribe.py`
- Test: `python3 -m unittest discover -s transcriber -v`

**Interfaces:**
- Consumes: nothing from the Node app
- Produces:
  - `transcribe_url(url: str, *, run, work_root: Path, timeout_seconds: int = 1800) -> str`
  - `GET /health` → `200 {"ok": true}`
  - `POST /transcribe` with `Authorization: Bearer <TRANSCRIBER_SECRET>` and `{"url": "..."}` → `200 {"transcript": "..."}`, `401`, `409 {"error": "busy"}`, or `422 {"error": "<reason>"}`

- [ ] **Step 1: Write the failing test**

```python
import shutil
import subprocess
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

from server import serve
from transcribe import TranscriptionError, transcribe_url

URL = "https://www.youtube.com/watch?v=abcdefghijk"


class Completed:
    def __init__(self):
        self.returncode = 0


def successful_run(command, timeout):
    del timeout
    if command[0] == "yt-dlp":
        output = command[command.index("-o") + 1].replace("%(ext)s", "wav")
        Path(output).write_bytes(b"source")
    if command[0] == "whisper":
        directory = Path(command[command.index("--output_dir") + 1])
        (directory / "audio.txt").write_text("Hello from the video\n", encoding="utf-8")
    return Completed()


class TranscribeTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())

    def tearDown(self):
        shutil.rmtree(self.root, ignore_errors=True)

    def test_deletes_the_directory_after_success(self):
        text = transcribe_url(URL, run=successful_run, work_root=self.root, timeout_seconds=30)
        self.assertEqual(text, "Hello from the video")
        self.assertEqual(list(self.root.iterdir()), [])

    def test_deletes_the_directory_when_the_download_fails(self):
        def fail_download(command, timeout):
            del timeout
            if command[0] == "yt-dlp":
                completed = Completed()
                completed.returncode = 1
                return completed
            return Completed()

        with self.assertRaises(TranscriptionError):
            transcribe_url(URL, run=fail_download, work_root=self.root, timeout_seconds=30)
        self.assertEqual(list(self.root.iterdir()), [])

    def test_deletes_the_directory_when_the_time_limit_is_hit(self):
        def time_out(command, timeout):
            raise subprocess.TimeoutExpired(command, timeout)

        with self.assertRaisesRegex(TranscriptionError, "30 minutes"):
            transcribe_url(URL, run=time_out, work_root=self.root, timeout_seconds=1)
        self.assertEqual(list(self.root.iterdir()), [])


class ServerTests(unittest.TestCase):
    def test_rejects_a_bad_secret_before_transcription(self):
        calls = []

        def transcribe(url):
            calls.append(url)
            return "nope"

        server = serve(transcribe, "secret", threading.Lock())
        self.addCleanup(server.shutdown)
        request = urllib.request.Request(
            f"http://127.0.0.1:{server.server_address[1]}/transcribe",
            data=b'{"url":"https://vimeo.com/123456789"}',
            headers={"Authorization": "Bearer wrong", "Content-Type": "application/json"},
            method="POST",
        )
        with self.assertRaises(urllib.error.HTTPError) as caught:
            urllib.request.urlopen(request)
        self.assertEqual(caught.exception.code, 401)
        self.assertEqual(calls, [])

    def test_returns_busy_while_a_transcription_is_running(self):
        started = threading.Event()
        release = threading.Event()

        def transcribe(url):
            del url
            started.set()
            release.wait(2)
            return "done"

        server = serve(transcribe, "secret", threading.Lock())
        self.addCleanup(server.shutdown)
        port = server.server_address[1]

        def call():
            request = urllib.request.Request(
                f"http://127.0.0.1:{port}/transcribe",
                data=b'{"url":"https://vimeo.com/123456789"}',
                headers={"Authorization": "Bearer secret", "Content-Type": "application/json"},
                method="POST",
            )
            return urllib.request.urlopen(request)

        first = threading.Thread(target=call)
        first.start()
        self.assertTrue(started.wait(2))
        with self.assertRaises(urllib.error.HTTPError) as caught:
            call()
        self.assertEqual(caught.exception.code, 409)
        release.set()
        first.join(2)
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `python3 -m unittest discover -s transcriber -v`

Expected: FAIL because `transcriber/transcribe.py` and `transcriber/server.py` do not exist.

- [ ] **Step 3: Write `transcriber/transcribe.py`**

```python
import shutil
import subprocess
import tempfile
import time
import urllib.parse
from pathlib import Path


class TranscriptionError(Exception):
    pass


def transcribe_url(url, *, run, work_root, timeout_seconds=1800):
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise TranscriptionError("The video link must start with http:// or https://.")

    directory = Path(tempfile.mkdtemp(prefix="pipeline-", dir=work_root))
    deadline = time.monotonic() + timeout_seconds
    try:
        source_template = str(directory / "source.%(ext)s")
        _run(
            ["yt-dlp", "-x", "--audio-format", "wav", "-o", source_template, "--no-playlist", url],
            run,
            deadline,
            "Could not download audio from this video.",
        )
        sources = [path for path in directory.iterdir() if path.name.startswith("source.")]
        if len(sources) != 1:
            raise TranscriptionError("Could not download audio from this video.")

        audio = directory / "audio.wav"
        _run(
            ["ffmpeg", "-y", "-i", str(sources[0]), "-ac", "1", "-ar", "16000", str(audio)],
            run,
            deadline,
            "Could not convert this video's audio.",
        )
        _run(
            [
                "whisper",
                str(audio),
                "--model",
                "turbo",
                "--task",
                "transcribe",
                "--output_format",
                "txt",
                "--output_dir",
                str(directory),
                "--fp16",
                "False",
            ],
            run,
            deadline,
            "Could not transcribe this video.",
        )
        transcript_path = directory / "audio.txt"
        if not transcript_path.is_file():
            raise TranscriptionError("Could not transcribe this video.")
        return transcript_path.read_text(encoding="utf-8").strip()
    finally:
        shutil.rmtree(directory, ignore_errors=True)


def _run(command, run, deadline, failure):
    remaining = deadline - time.monotonic()
    if remaining <= 0:
        raise TranscriptionError("This video took longer than 30 minutes.")
    try:
        completed = run(command, remaining)
    except subprocess.TimeoutExpired as error:
        raise TranscriptionError("This video took longer than 30 minutes.") from error
    if completed.returncode != 0:
        raise TranscriptionError(failure)
```

- [ ] **Step 4: Write `transcriber/server.py`**

```python
import json
import os
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import gettempdir

from transcribe import TranscriptionError, transcribe_url


def serve(transcribe, secret, lock, port=0):
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path != "/health":
                self._json(404, {"error": "Not found"})
                return
            self._json(200, {"ok": True})

        def do_POST(self):
            if self.path != "/transcribe":
                self._json(404, {"error": "Not found"})
                return
            if self.headers.get("Authorization", "") != f"Bearer {secret}":
                self._json(401, {"error": "Unauthorized"})
                return
            if not lock.acquire(blocking=False):
                self._json(409, {"error": "busy"})
                return
            try:
                length = int(self.headers.get("Content-Length", "0"))
                raw = self.rfile.read(length)
                try:
                    body = json.loads(raw.decode("utf-8"))
                    url = body["url"]
                except (json.JSONDecodeError, KeyError, TypeError, UnicodeDecodeError):
                    self._json(422, {"error": "The video link must start with http:// or https://."})
                    return
                try:
                    transcript = transcribe(url)
                except TranscriptionError as error:
                    self._json(422, {"error": str(error)})
                    return
                self._json(200, {"transcript": transcript})
            finally:
                lock.release()

        def _json(self, status, payload):
            encoded = json.dumps(payload).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(encoded)))
            self.end_headers()
            self.wfile.write(encoded)

        def log_message(self, fmt, *args):
            return

    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def main():
    secret = os.environ.get("TRANSCRIBER_SECRET", "")
    lock = threading.Lock()

    def transcribe(url):
        return transcribe_url(url, run=_subprocess_run, work_root=Path(gettempdir()))

    serve(transcribe, secret, lock, port=8080)
    threading.Event().wait()


def _subprocess_run(command, timeout):
    return __import__("subprocess").run(command, timeout=timeout, check=False)


if __name__ == "__main__":
    main()
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `python3 -m unittest discover -s transcriber -v`

Expected: `TranscribeTests` and `ServerTests` all OK.

- [ ] **Step 6: Commit**

```bash
git add transcriber/transcribe.py transcriber/server.py transcriber/test_transcribe.py
git commit -m "$(cat <<'EOF'
feat: transcribe one video and delete its media

Run yt-dlp, ffmpeg, and Whisper turbo in a private service that removes the temp directory on every exit.
EOF
)"
```

---

### Task 8: Docker wiring

**Files:**
- Create: `transcriber/Dockerfile`
- Create: `transcriber/requirements.txt`
- Modify: `docker-compose.yml`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `transcriber/server.py` listening on port 8080
- Produces: Compose service `transcriber` and app env `TRANSCRIBER_URL=http://transcriber:8080`

- [ ] **Step 1: Write the image files**

`transcriber/requirements.txt`:

```text
openai-whisper==20240930
yt-dlp==2026.8.19
```

`transcriber/Dockerfile`:

```dockerfile
FROM python:3.11-slim-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/transcriber
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY transcribe.py server.py ./

ENV PYTHONUNBUFFERED=1
EXPOSE 8080
CMD ["python", "server.py"]
```

- [ ] **Step 2: Replace `docker-compose.yml` with this file**

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: payload
      POSTGRES_PASSWORD: payload
      POSTGRES_DB: unlocked_ventures
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U payload -d unlocked_ventures']
      interval: 5s
      timeout: 5s
      retries: 20

  transcriber:
    build: ./transcriber
    environment:
      TRANSCRIBER_SECRET: ${TRANSCRIBER_SECRET:-}
    volumes:
      - whisper-models:/root/.cache/whisper
    expose:
      - '8080'
    healthcheck:
      test:
        [
          'CMD',
          'python',
          '-c',
          'import urllib.request; urllib.request.urlopen("http://127.0.0.1:8080/health")',
        ]
      interval: 10s
      timeout: 5s
      retries: 10

  app:
    image: node:22-bookworm
    working_dir: /app
    init: true
    extra_hosts:
      - host.docker.internal:host-gateway
    command: sh /app/scripts/docker-dev.sh
    ports:
      - '3000:3000'
    env_file:
      - .env
    environment:
      TRANSCRIBER_URL: http://transcriber:8080
    volumes:
      - .:/app
      - node_modules:/app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      transcriber:
        condition: service_healthy

volumes:
  pgdata:
  node_modules:
  whisper-models:
```

Add this line to `.env.example`:

```text
TRANSCRIBER_SECRET=replace-with-a-long-random-string
```

Add the same key to the local `.env` with a real secret. Do not commit `.env`.

- [ ] **Step 3: Build and check health**

Run: `docker compose up -d --build transcriber`

Run: `docker compose exec transcriber python -c 'import urllib.request; print(urllib.request.urlopen("http://127.0.0.1:8080/health").read())'`

Expected: `b'{"ok": true}'`

- [ ] **Step 4: Manual transcript check**

Start the app with `docker compose up`. In the admin portal, open Pipeline, save a document named `Manual check` with one short public video URL, and click Generate Transcript.

Expected: status becomes processing, the transcript field fills with a `## <url>` block, status becomes ready, and `docker compose exec transcriber sh -c 'find /tmp -name "source.*" -o -name "audio.wav"'` prints nothing.

Run it again after adding a second URL that is not a real video, such as `https://example.com/not-a-video`.

Expected: the successful video’s new transcript is present, the bad URL is followed by `Could not transcribe this video:`, and status is error.

- [ ] **Step 5: Commit**

```bash
git add transcriber/Dockerfile transcriber/requirements.txt docker-compose.yml .env.example
git commit -m "$(cat <<'EOF'
feat: run Whisper turbo beside the admin app

Keep the model cache in a volume and leave video files out of the website container.
EOF
)"
```
