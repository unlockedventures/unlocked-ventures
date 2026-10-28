'use client'

import { Button, useAllFormFields, useAuth, useDocumentInfo } from '@payloadcms/ui'
import { useEffect, useState } from 'react'
import { useSourceSummary } from '@/components/admin/use-source-summary'
import { sourceSummaryInput } from '@/pipeline/source-summary'
import { validateEditorPrompt } from '@/pipeline/prompt-constraints'

export function GenerateSourceSummaryField() {
  const { id } = useDocumentInfo()
  const { permissions } = useAuth()
  const [fields, dispatch] = useAllFormFields()
  const { source, revision, current } = useSourceSummary(fields)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const canGenerate = permissions?.collections?.['podcast-episodes']?.update === true
  const expiresAt = Date.parse(String(fields.generationLockExpiresAt?.value ?? ''))
  const expiredLease = Number.isFinite(expiresAt) && expiresAt < Date.now()
  const busy =
    pending ||
    (!expiredLease &&
      ['status', 'scriptStatus', 'audioStatus', 'sourceSummaryStatus'].some(
        (path) => fields[path]?.value === 'processing',
      ))
  const inputError = sourceSummaryInput(source).error
  const prompt = String(fields.sourceSummaryPrompt?.value ?? '')
  const promptRevision = String(fields.sourceSummaryPromptRevision?.value ?? '')
  const promptValidation = validateEditorPrompt(prompt)
  const promptError = 'error' in promptValidation ? promptValidation.error : ''
  const promptCurrent = Boolean(revision && promptRevision === revision)
  const unsavedSources = Boolean(revision) && revision !== source.currentSourceRevision
  const hint = !id
    ? 'Save this episode before generating a source summary.'
    : busy
      ? 'Wait for episode generation to finish.'
      : inputError || (unsavedSources ? 'Save your source transcript and video changes first.' : '')
  const disabled =
    !id ||
    busy ||
    Boolean(inputError) ||
    unsavedSources ||
    !revision ||
    Boolean(promptError) ||
    !promptCurrent

  function apply(doc: Record<string, unknown>) {
    for (const path of [
      'sourceSummary',
      'sourceSummaryRevision',
      'currentSourceRevision',
      'sourceSummaryStatus',
      'sourceSummaryMessage',
      'sourceSummaryPrompt',
      'sourceSummaryPromptRevision',
      'status',
      'scriptStatus',
      'audioStatus',
      'generationLockExpiresAt',
    ]) {
      if (doc[path] !== undefined) dispatch({ type: 'UPDATE', path, value: doc[path] ?? '' })
    }
  }

  useEffect(() => {
    if (fields.sourceSummaryStatus?.value !== 'processing' || !id) return
    let cancelled = false
    const timer = setInterval(() => {
      void fetch(`/api/podcast-episodes/${id}?depth=0`, {
        credentials: 'include',
        cache: 'no-store',
      })
        .then(async (response) => {
          if (response.ok && !cancelled) apply(await response.json())
        })
        .catch(() => {})
    }, 3000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [fields.sourceSummaryStatus?.value, id, dispatch])

  useEffect(() => {
    const input = document.querySelector<HTMLTextAreaElement>('#field-sourceSummary')
    if (!input) return
    const prior = input.readOnly
    input.readOnly = busy
    return () => {
      input.readOnly = prior
    }
  }, [busy])

  async function generate() {
    if (disabled) return
    const promptInput = document.querySelector<HTMLTextAreaElement>('#field-sourceSummaryPrompt')
    const livePrompt = (promptInput ? promptInput.value : prompt).trim()
    setPending(true)
    setMessage('Generating a combined summary of all current videos…')
    dispatch({ type: 'UPDATE', path: 'sourceSummaryStatus', value: 'processing' })
    try {
      const response = await fetch('/api/podcast-episodes/generate-source-summary', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          sourceSummaryPrompt: livePrompt,
          sourceSummaryPromptRevision: promptRevision,
        }),
      })
      const body = await response.json()
      if (!response.ok)
        setMessage(body.error || 'Could not generate the source summary. Try again.')
      else {
        apply(body)
        setMessage('Source summary ready. You can edit it before generating the podcast.')
      }
    } catch {
      setMessage(
        'Could not finish the request. Check the source summary job status before retrying.',
      )
    } finally {
      try {
        const response = await fetch(`/api/podcast-episodes/${id}?depth=0`, {
          credentials: 'include',
          cache: 'no-store',
        })
        if (response.ok) apply(await response.json())
      } catch {
        /* Active job polling will recover through temporary network failures. */
      }
      setPending(false)
    }
  }

  if (!canGenerate) return null
  return (
    <div className="field-type ui">
      <Button
        type="button"
        data-testid="source-summary-generate-button"
        disabled={disabled}
        onClick={() => void generate()}
      >
        Generate source summary
      </Button>
      <p role="status">
        {message ||
          hint ||
          (!promptCurrent ? 'Generate a current source-summary prompt first.' : promptError) ||
          String(fields.sourceSummaryMessage?.value || '') ||
          (current
            ? 'Source summary is current and editable.'
            : 'Generate a current source summary before creating a podcast.')}
      </p>
    </div>
  )
}
