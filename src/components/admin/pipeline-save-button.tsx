'use client'

import {
  FormSubmit,
  useAllFormFields,
  useDocumentInfo,
  useEditDepth,
  useForm,
  useFormModified,
  useHotkey,
  useOperation,
  useTranslation,
} from '@payloadcms/ui'
import { useRef } from 'react'

function fieldText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

/** Disable Save while a transcript or podcast-script generation is running. */
export function PipelineSaveButton({ label: labelProp }: { label?: string }) {
  const { uploadStatus } = useDocumentInfo()
  const { t } = useTranslation()
  const { submit } = useForm()
  const modified = useFormModified()
  const [fields] = useAllFormFields()
  const label = labelProp || t('general:save')
  const ref = useRef<HTMLButtonElement>(null)
  const editDepth = useEditDepth()
  const operation = useOperation()
  const status = fieldText(fields.status?.value)
  const scriptStatus = fieldText(fields.scriptStatus?.value)
  const generating = status === 'processing' || scriptStatus === 'processing'
  const disabled =
    generating || (operation === 'update' && !modified) || uploadStatus === 'uploading'

  useHotkey({ cmdCtrlKey: true, editDepth, keyCodes: ['s'] }, (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    ref.current?.click()
  })

  return (
    <FormSubmit
      buttonId="action-save"
      disabled={disabled}
      onClick={() => {
        if (uploadStatus === 'uploading' || generating) return
        void submit()
      }}
      ref={ref}
      size="medium"
      type="button"
    >
      {label}
    </FormSubmit>
  )
}
