'use client'

import {
  FormSubmit,
  useAuth,
  useAllFormFields,
  useDocumentInfo,
  useEditDepth,
  useForm,
  useFormModified,
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
  const modified = useFormModified()
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
  const unchanged = operation === 'update' && !modified

  useHotkey({ cmdCtrlKey: true, editDepth, keyCodes: ['s'] }, (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy || !canSave) return
    draftRef.current?.click()
  })

  async function saveAs(episodeStatus: 'draft' | 'complete') {
    if (busy || !canSave) return
    await submit({ overrides: { episodeStatus } })
  }

  if (!canSave) return null

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
      <FormSubmit
        buttonId="action-save-draft"
        disabled={busy || unchanged}
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
        disabled={busy || unchanged}
        onClick={() => {
          void saveAs('complete')
        }}
        ref={completeRef}
        size="medium"
        type="button"
      >
        Save as Complete
      </FormSubmit>
    </div>
  )
}
