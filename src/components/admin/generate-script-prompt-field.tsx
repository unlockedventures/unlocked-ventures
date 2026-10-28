'use client'

import { Button, useAllFormFields, useAuth, useDocumentInfo } from '@payloadcms/ui'
import { useState } from 'react'

import { useSourceSummary } from '@/components/admin/use-source-summary'
import { podcastScriptPromptRevision } from '@/pipeline/prompt-revision'
import { isSpeakerGender } from '@/pipeline/script-schema'

export function GenerateScriptPromptField() {
  const { id } = useDocumentInfo()
  const { permissions } = useAuth()
  const [fields, dispatch] = useAllFormFields()
  const { source, current } = useSourceSummary(fields)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState('')
  const hostGender = String(fields.hostGender?.value ?? '')
  const guestGender = String(fields.guestGender?.value ?? '')
  const prompt = String(fields.scriptPrompt?.value ?? '').trim()
  const promptRevision = String(fields.scriptPromptRevision?.value ?? '')
  const gendersValid = isSpeakerGender(hostGender) && isSpeakerGender(guestGender)
  const expectedRevision = podcastScriptPromptRevision({
    sourceSummary: source.sourceSummary,
    hostGender,
    guestGender,
  })
  const promptCurrent = Boolean(prompt && gendersValid && promptRevision === expectedRevision)
  const busy =
    pending ||
    ['status', 'scriptStatus', 'audioStatus', 'sourceSummaryStatus'].some(
      (path) => fields[path]?.value === 'processing',
    )
  const canUpdate = permissions?.collections?.['podcast-episodes']?.update === true
  const disabled = !id || busy || !current || !source.sourceSummary.trim() || !gendersValid

  async function generatePrompt() {
    if (disabled || id == null || !gendersValid) return
    setPending(true)
    setMessage('Generating an editable podcast-script prompt…')
    try {
      const response = await fetch('/api/podcast-episodes/generate-script-prompt', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          hostGender,
          guestGender,
          sourceSummary: source.sourceSummary,
          sourceSummaryRevision: source.sourceSummaryRevision,
        }),
      })
      const body = (await response.json().catch(() => null)) as {
        scriptPrompt?: string
        scriptPromptRevision?: string
        error?: string
      } | null
      if (!response.ok) {
        setMessage(body?.error || 'Could not generate the podcast-script prompt.')
        return
      }
      dispatch({ type: 'UPDATE', path: 'scriptPrompt', value: body?.scriptPrompt ?? '' })
      dispatch({
        type: 'UPDATE',
        path: 'scriptPromptRevision',
        value: body?.scriptPromptRevision ?? '',
      })
      setMessage('Prompt ready. Review or edit it before generating the podcast script.')
    } catch {
      setMessage('Could not generate the podcast-script prompt.')
    } finally {
      setPending(false)
    }
  }

  if (!canUpdate) return null
  const hint = !current
    ? 'Generate a current source summary first.'
    : !gendersValid
      ? 'Choose host and guest genders first.'
      : prompt && !promptCurrent
        ? 'Summary or speaker settings changed. Regenerate this prompt.'
        : promptCurrent
          ? 'Prompt is current and editable.'
          : ''

  return (
    <div className="field-type ui">
      <Button type="button" disabled={disabled} onClick={() => void generatePrompt()}>
        {pending ? 'Generating Prompt…' : prompt ? 'Regenerate Prompt' : 'Generate Prompt'}
      </Button>
      <p role="status">{message || hint}</p>
    </div>
  )
}
