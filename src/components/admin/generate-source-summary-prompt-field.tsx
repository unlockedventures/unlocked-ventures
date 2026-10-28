'use client'

import { Button, useAllFormFields, useAuth, useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

import { useSourceSummary } from '@/components/admin/use-source-summary'
import { sourceSummaryInput } from '@/pipeline/source-summary'

export function GenerateSourceSummaryPromptField() {
  const { id } = useDocumentInfo()
  const { permissions } = useAuth()
  const [fields, dispatch] = useAllFormFields()
  const { source, revision } = useSourceSummary(fields)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const prompt = String(fields.sourceSummaryPrompt?.value ?? '').trim()
  const promptRevision = String(fields.sourceSummaryPromptRevision?.value ?? '')
  const busy =
    pending ||
    ['status', 'scriptStatus', 'audioStatus', 'sourceSummaryStatus'].some(
      (path) => fields[path]?.value === 'processing',
    )
  const inputError = sourceSummaryInput(source).error
  const unsavedSources = Boolean(revision) && revision !== source.currentSourceRevision
  const canUpdate = permissions?.collections?.['podcast-episodes']?.update === true
  const disabled = !id || busy || Boolean(inputError) || unsavedSources || !revision
  const current = Boolean(prompt && revision && promptRevision === revision)

  async function generatePrompt() {
    if (disabled || id == null) return
    setPending(true)
    setMessage('Generating an editable source-summary prompt…')
    try {
      const response = await fetch('/api/podcast-episodes/generate-source-summary-prompt', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const body = (await response.json().catch(() => null)) as {
        sourceSummaryPrompt?: string
        sourceSummaryPromptRevision?: string
        currentSourceRevision?: string
        error?: string
      } | null
      if (!response.ok) {
        setMessage(body?.error || 'Could not generate the source-summary prompt.')
        return
      }
      dispatch({
        type: 'UPDATE',
        path: 'sourceSummaryPrompt',
        value: body?.sourceSummaryPrompt ?? '',
      })
      dispatch({
        type: 'UPDATE',
        path: 'sourceSummaryPromptRevision',
        value: body?.sourceSummaryPromptRevision ?? '',
      })
      if (body?.currentSourceRevision) {
        dispatch({
          type: 'UPDATE',
          path: 'currentSourceRevision',
          value: body.currentSourceRevision,
        })
      }
      setMessage('Prompt ready. Review or edit it before generating the source summary.')
    } catch {
      setMessage('Could not generate the source-summary prompt.')
    } finally {
      setPending(false)
    }
  }

  if (!canUpdate) return null
  const hint = !id
    ? 'Save this episode before generating a prompt.'
    : inputError || (unsavedSources ? 'Save current source changes first.' : '')
  const status = prompt && !current ? 'Source inputs changed. Regenerate this prompt.' : ''

  return (
    <div className="field-type ui">
      <Button type="button" disabled={disabled} onClick={() => void generatePrompt()}>
        {pending ? 'Generating Prompt…' : prompt ? 'Regenerate Prompt' : 'Generate Prompt'}
      </Button>
      <p role="status">
        {message || hint || status || (current ? 'Prompt is current and editable.' : '')}
      </p>
    </div>
  )
}
