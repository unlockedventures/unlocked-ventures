'use client'

import {
  FormSubmit,
  useAuth,
  useAllFormFields,
  useDocumentInfo,
  useEditDepth,
  useForm,
  useHotkey,
  useOperation,
} from '@payloadcms/ui'
import { useRef } from 'react'

function fieldText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

/** Save as Draft + Save as Complete; disabled while AI generation is running. */
export function EpisodeSaveButtons() {
  const { uploadStatus } = useDocumentInfo()
  const { submit } = useForm()
  const [fields] = useAllFormFields()
  const draftRef = useRef<HTMLButtonElement>(null)
  const completeRef = useRef<HTMLButtonElement>(null)
  const editDepth = useEditDepth()
  const operation = useOperation()
  const { permissions } = useAuth()
  const grants = permissions?.collections?.['podcast-episodes']
  const canSave = operation === 'create' ? grants?.create === true : grants?.update === true
  const status = fieldText(fields.status?.value)
  const scriptStatus = fieldText(fields.scriptStatus?.value)
  const audioStatus = fieldText(fields.audioStatus?.value)
  const generating =
    status === 'processing' || scriptStatus === 'processing' || audioStatus === 'processing'
  const busy = generating || uploadStatus === 'uploading'
  const unsavedAudio = Boolean(fields.pendingAudio?.value)
  const missingAiAudio =
    fields.editorMode?.value === 'ai' &&
    (fields.audioSource?.value !== 'upload' || !fields.audio?.value)
  const audioNeedsSaving = unsavedAudio || missingAiAudio

  useHotkey({ cmdCtrlKey: true, editDepth, keyCodes: ['s'] }, (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy || !canSave) return
    draftRef.current?.click()
  })

  async function saveAs(episodeStatus: 'draft' | 'complete') {
    if (busy || !canSave || (episodeStatus === 'complete' && audioNeedsSaving)) return
    await submit({ overrides: { episodeStatus } })
  }

  if (!canSave) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <FormSubmit
        buttonId="action-save-draft"
        disabled={busy}
        onClick={() => {
          void saveAs('draft')
        }}
        ref={draftRef}
        size="medium"
        type="button"
      >
        Save as Draft
      </FormSubmit>
      <FormSubmit
        buttonId="action-save-complete"
        disabled={busy || audioNeedsSaving}
        onClick={() => {
          void saveAs('complete')
        }}
        ref={completeRef}
        size="medium"
        type="button"
      >
        Save as Complete
      </FormSubmit>
      {audioNeedsSaving && !generating ? (
        <span role="status">
          {unsavedAudio
            ? 'Select “Save Generated Audio” before saving as complete. You can still save a draft.'
            : 'Generate and save episode audio before saving as complete. You can still save a draft.'}
        </span>
      ) : null}
      {generating ? (
        <span role="status">Generation is in progress. You can save when it finishes.</span>
      ) : null}
    </div>
  )
}
