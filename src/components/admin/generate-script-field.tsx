'use client'

import { Button, useAuth, useAllFormFields, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useRef, useState } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { useSourceSummary } from '@/components/admin/use-source-summary'
import { scriptButtonState } from '@/pipeline/script-button-state'
import { podcastScriptPromptRevision } from '@/pipeline/prompt-revision'
import { validateEditorPrompt } from '@/pipeline/prompt-constraints'

import './generate-podcast-skeleton.css'

type PointRow = { id?: string | null; point?: string | null }

type PipelineResponse = {
  scriptJson?: string | null
  summary?: string | null
  mainPoints?: PointRow[] | null
  contrastingPoints?: PointRow[] | null
  disagreementPoints?: PointRow[] | null
  systemOpinion?: string | null
  scriptStatus?: string | null
  scriptStatusMessage?: string | null
  transcript?: string | null
  error?: string
  scriptPrompt?: string | null
  scriptPromptRevision?: string | null
}

type DispatchFields = ReturnType<typeof useAllFormFields>[1]

function fieldText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function rowCount(fields: Record<string, { rows?: unknown[] } | undefined>, path: string) {
  return fields[path]?.rows?.length ?? 0
}

function syncPointArray(
  dispatchFields: DispatchFields,
  path: string,
  points: PointRow[],
  currentCount: number,
) {
  for (let index = currentCount - 1; index >= 0; index -= 1) {
    dispatchFields({ type: 'REMOVE_ROW', path, rowIndex: index })
  }

  points.forEach((row, rowIndex) => {
    const point = typeof row.point === 'string' ? row.point : ''
    const id = typeof row.id === 'string' ? row.id : undefined
    dispatchFields({
      type: 'ADD_ROW',
      path,
      rowIndex,
      subFieldState: {
        point: { value: point, initialValue: point, valid: true },
        ...(id ? { id: { value: id, initialValue: id, valid: true } } : {}),
      },
    })
  })
}

function applyDoc(
  dispatchFields: DispatchFields,
  fields: Record<string, { rows?: unknown[] } | undefined>,
  doc: PipelineResponse,
) {
  dispatchFields({ type: 'UPDATE', path: 'scriptJson', value: doc.scriptJson ?? '' })
  dispatchFields({ type: 'UPDATE', path: 'summary', value: doc.summary ?? '' })
  dispatchFields({ type: 'UPDATE', path: 'systemOpinion', value: doc.systemOpinion ?? '' })
  dispatchFields({ type: 'UPDATE', path: 'scriptStatus', value: doc.scriptStatus ?? 'idle' })
  dispatchFields({
    type: 'UPDATE',
    path: 'scriptStatusMessage',
    value: doc.scriptStatusMessage ?? '',
  })
  if (doc.scriptPrompt !== undefined) {
    dispatchFields({ type: 'UPDATE', path: 'scriptPrompt', value: doc.scriptPrompt ?? '' })
  }
  if (doc.scriptPromptRevision !== undefined) {
    dispatchFields({
      type: 'UPDATE',
      path: 'scriptPromptRevision',
      value: doc.scriptPromptRevision ?? '',
    })
  }

  syncPointArray(dispatchFields, 'mainPoints', doc.mainPoints ?? [], rowCount(fields, 'mainPoints'))
  syncPointArray(
    dispatchFields,
    'contrastingPoints',
    doc.contrastingPoints ?? [],
    rowCount(fields, 'contrastingPoints'),
  )
  syncPointArray(
    dispatchFields,
    'disagreementPoints',
    doc.disagreementPoints ?? [],
    rowCount(fields, 'disagreementPoints'),
  )
}

export function GenerateScriptField() {
  const { id } = useDocumentInfo()
  const { permissions } = useAuth()
  const canGenerate = permissions?.collections?.['podcast-episodes']?.update === true
  const [fields, dispatchFields] = useAllFormFields()
  const { source, current } = useSourceSummary(fields)
  const [watching, setWatching] = useState(false)
  const [pending, setPending] = useState(false)
  const [localMessage, setLocalMessage] = useState<string | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const scriptStatus = fieldText(fields.scriptStatus?.value) || 'idle'
  const scriptStatusMessage = fieldText(fields.scriptStatusMessage?.value)
  const transcriptStatus = fieldText(fields.status?.value) || 'idle'
  const scriptPrompt = fieldText(fields.scriptPrompt?.value)
  const scriptPromptRevision = fieldText(fields.scriptPromptRevision?.value)
  const expectedPromptRevision = podcastScriptPromptRevision({
    sourceSummary: source.sourceSummary,
  })
  const promptValidation = validateEditorPrompt(scriptPrompt)
  const promptError = 'error' in promptValidation ? promptValidation.error : ''
  const promptCurrent = Boolean(
    scriptPrompt.trim() && scriptPromptRevision === expectedPromptRevision,
  )
  const statusRef = useRef(scriptStatus)
  const fieldsRef = useRef(fields)
  /** Ignore stale ready/error from a previous run until this run has been processing on the server. */
  const seenProcessingRef = useRef(false)
  statusRef.current = scriptStatus
  fieldsRef.current = fields
  const transcribing = transcriptStatus === 'processing'

  useEffect(() => {
    const form = rootRef.current?.closest('form')
    if (!form) return
    form.classList.toggle('uv-pipeline-transcribing', transcribing)
    return () => form.classList.remove('uv-pipeline-transcribing')
  }, [transcribing])

  const button = scriptButtonState({
    saved: id != null && id !== '',
    hasTranscript: source.sourceSummary.trim() !== '',
    hasCurrentSourceSummary: current,
    scriptStatus,
    transcriptStatus,
    pending:
      pending ||
      fields.sourceSummaryStatus?.value === 'processing' ||
      fields.audioStatus?.value === 'processing',
  })
  const generationDisabled = button.disabled || Boolean(promptError) || !promptCurrent

  useEffect(() => {
    if (scriptStatus === 'processing') setWatching(true)
  }, [scriptStatus])

  useEffect(() => {
    if (!watching || id == null || id === '') return
    let cancelled = false

    async function pull() {
      try {
        const response = await fetch(`/api/podcast-episodes/${id}?depth=0`, {
          credentials: 'include',
        })
        if (!response.ok || cancelled) return
        const doc = (await response.json()) as PipelineResponse
        if (cancelled) return

        if (doc.scriptStatus === 'processing') {
          seenProcessingRef.current = true
          applyDoc(dispatchFields, fieldsRef.current, doc)
          return
        }

        // Stale ready/error from before this click — keep waiting for processing.
        if (
          (doc.scriptStatus === 'ready' || doc.scriptStatus === 'error') &&
          !seenProcessingRef.current
        ) {
          return
        }

        applyDoc(dispatchFields, fieldsRef.current, doc)
        if (doc.scriptStatus === 'ready' || doc.scriptStatus === 'error') {
          setPending(false)
          setWatching(false)
        }
      } catch {
        // Keep polling through transient network errors while a run is active.
        if (cancelled) return
      }
    }

    void pull()
    const timer = setInterval(() => void pull(), 3000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [dispatchFields, id, watching])

  async function onGenerate() {
    if (generationDisabled || id == null) return
    const input = document.querySelector<HTMLTextAreaElement>('#field-sourceSummary')
    const sourceSummary = (input ? input.value : source.sourceSummary).trim()
    if (!sourceSummary) {
      setLocalMessage('Add a nonblank source summary before creating a podcast script.')
      return
    }
    const promptInput = document.querySelector<HTMLTextAreaElement>('#field-scriptPrompt')
    const livePrompt = (promptInput ? promptInput.value : scriptPrompt).trim()
    setLocalMessage(null)
    setPending(true)
    seenProcessingRef.current = false
    setWatching(true)
    dispatchFields({ type: 'UPDATE', path: 'scriptStatus', value: 'processing' })
    dispatchFields({
      type: 'UPDATE',
      path: 'scriptStatusMessage',
      value: 'Generating podcast script…',
    })
    try {
      const response = await fetch('/api/podcast-episodes/generate-script', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          sourceSummary,
          sourceSummaryRevision: source.sourceSummaryRevision,
          scriptPrompt: livePrompt,
          scriptPromptRevision,
        }),
      })
      const body = (await response.json().catch(() => null)) as PipelineResponse | null
      if (!response.ok) {
        if (
          response.status === 409 &&
          body?.error === 'Wait for the transcript to finish before creating a podcast script.'
        ) {
          setLocalMessage(body.error)
          setPending(false)
          setWatching(false)
          dispatchFields({ type: 'UPDATE', path: 'scriptStatus', value: 'idle' })
          dispatchFields({ type: 'UPDATE', path: 'scriptStatusMessage', value: '' })
          return
        }
        if (
          response.status === 409 &&
          body?.error === 'This podcast script is already being generated.'
        ) {
          seenProcessingRef.current = true
          setWatching(true)
          setPending(true)
          return
        }
        setLocalMessage(body?.error ?? 'Could not generate a podcast script.')
        try {
          const refresh = await fetch(`/api/podcast-episodes/${id}?depth=0`, {
            credentials: 'include',
          })
          if (!refresh.ok) {
            if (statusRef.current !== 'processing') {
              setWatching(false)
              setPending(false)
            }
            return
          }
          const doc = (await refresh.json()) as PipelineResponse
          if (doc.scriptStatus === 'processing') seenProcessingRef.current = true
          applyDoc(dispatchFields, fieldsRef.current, doc)
          if (doc.scriptStatus === 'processing') {
            setWatching(true)
            setPending(true)
          } else {
            setWatching(false)
            setPending(false)
          }
        } catch {
          if (statusRef.current !== 'processing') {
            setWatching(false)
            setPending(false)
          }
        }
        return
      }

      seenProcessingRef.current = true
      try {
        const refresh = await fetch(`/api/podcast-episodes/${id}?depth=0`, {
          credentials: 'include',
        })
        if (refresh.ok) {
          const doc = (await refresh.json()) as PipelineResponse
          applyDoc(dispatchFields, fieldsRef.current, doc)
        }
      } catch {
        // polling effect will catch up if needed
      }
      setPending(false)
      setWatching(false)
    } catch {
      // Long Gemini runs can time out the browser fetch while the server keeps working.
      setWatching(true)
      setPending(true)
    }
  }

  if (!canGenerate) return null

  const detail =
    localMessage ||
    button.hint ||
    (!promptCurrent ? 'Generate a current podcast-script prompt first.' : promptError) ||
    scriptStatusMessage

  return (
    <div ref={rootRef} className="field-type ui">
      {transcribing ? (
        <div className="uv-podcast-skeleton" role="status" aria-live="polite">
          <p className="uv-podcast-skeleton__status">
            Generating the transcript from the video link…
          </p>
          <Skeleton className="uv-podcast-skeleton__select" />
          <Skeleton className="uv-podcast-skeleton__select" />
          <Skeleton className="uv-podcast-skeleton__button" />
          <Skeleton className="uv-podcast-skeleton__summary" />
          <Skeleton className="uv-podcast-skeleton__script" />
          <Skeleton className="uv-podcast-skeleton__line" />
          <Skeleton className="uv-podcast-skeleton__line" />
          <Skeleton className="uv-podcast-skeleton__line" />
          <Skeleton className="uv-podcast-skeleton__opinion" />
        </div>
      ) : (
        <>
          <Button
            buttonStyle="primary"
            disabled={generationDisabled}
            onClick={() => void onGenerate()}
          >
            Generate Podcast Script
          </Button>
          {detail ? <p>{detail}</p> : null}
        </>
      )}
    </div>
  )
}
