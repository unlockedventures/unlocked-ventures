'use client'

import { useFormFields } from '@payloadcms/ui'
import { useEffect, useMemo, useState } from 'react'

import {
  CONTACT_EMAIL_PREVIEW_VARS,
  isLexicalEditorState,
  lexicalEmailToHtml,
  renderContactEmailTemplate,
  resolveContactEmailHtml,
} from '@/lib/contact/email-template'
import { populateLexicalUploadsClient } from '@/lib/contact/populate-lexical-uploads'

/**
 * Live preview of the contact-form owner email, filled with sample placeholder values.
 * Populates Lexical upload nodes so inserted images appear in the preview.
 */
export function ContactEmailPreviewField() {
  const body = useFormFields(([fields]) => fields.contactEmailBody?.value)
  const subject = useFormFields(([fields]) => fields.contactEmailSubject?.value)
  const [htmlTemplate, setHtmlTemplate] = useState('')

  useEffect(() => {
    let cancelled = false

    async function build() {
      if (!isLexicalEditorState(body)) {
        if (!cancelled) setHtmlTemplate(resolveContactEmailHtml({ body }))
        return
      }

      try {
        const populated = await populateLexicalUploadsClient(body)
        if (!cancelled) setHtmlTemplate(lexicalEmailToHtml(populated))
      } catch {
        if (!cancelled) setHtmlTemplate(lexicalEmailToHtml(body))
      }
    }

    void build()
    return () => {
      cancelled = true
    }
  }, [body])

  const preview = useMemo(() => {
    const subjectTemplate =
      typeof subject === 'string' && subject.trim()
        ? subject
        : 'New contact message from {{firstName}} {{lastName}}'

    return {
      subject: renderContactEmailTemplate(subjectTemplate, CONTACT_EMAIL_PREVIEW_VARS),
      html: renderContactEmailTemplate(
        htmlTemplate || resolveContactEmailHtml({ body }),
        CONTACT_EMAIL_PREVIEW_VARS,
      ),
    }
  }, [body, htmlTemplate, subject])

  const hasBody = Boolean(preview.html.trim())

  return (
    <div className="field-type" style={{ height: '100%' }}>
      <label className="field-label">Live preview</label>
      <p className="field-description" style={{ marginBottom: '0.75rem' }}>
        Sample values fill {'{{placeholders}}'}. Images from the editor appear here after they load.
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 420,
          height: '100%',
          borderRadius: 12,
          border: '1px solid var(--theme-elevation-150)',
          background: 'linear-gradient(180deg, var(--theme-elevation-50) 0%, var(--theme-elevation-0) 48px)',
          boxShadow: '0 10px 28px -18px rgba(0,0,0,0.45)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderBottom: '1px solid var(--theme-elevation-150)',
            fontSize: 12,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            opacity: 0.72,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: '#34c759',
              boxShadow: '0 0 0 3px rgba(52,199,89,0.18)',
            }}
          />
          Inbox preview
        </div>

        <div
          style={{
            padding: '12px 14px',
            borderBottom: '1px solid var(--theme-elevation-100)',
            background: 'var(--theme-elevation-50)',
          }}
        >
          <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 4 }}>Subject</div>
          <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{preview.subject}</div>
        </div>

        <div
          style={{
            flex: 1,
            padding: 16,
            background: 'var(--theme-elevation-0)',
          }}
        >
          <div
            style={{
              minHeight: 280,
              height: '100%',
              padding: '20px 18px',
              borderRadius: 10,
              background: '#f4f1ec',
              color: '#2a2a2a',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 15,
              lineHeight: 1.55,
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
              overflow: 'auto',
            }}
          >
            {hasBody ? (
              <div
                className="uv-contact-email-preview-body"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            ) : (
              <p style={{ margin: 0, opacity: 0.55, fontFamily: 'system-ui, sans-serif', fontSize: 13 }}>
                Start designing the email on the left — the preview updates as you type.
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .uv-contact-email-preview-body p { margin: 0 0 0.85em; }
        .uv-contact-email-preview-body p:last-child { margin-bottom: 0; }
        .uv-contact-email-preview-body img {
          max-width: 100% !important;
          height: auto !important;
          display: block;
          margin: 0 0 1em;
          border-radius: 6px;
        }
        .uv-contact-email-preview-body a { color: #0b6e6e; }
        .uv-contact-email-preview-body ul,
        .uv-contact-email-preview-body ol { padding-left: 1.25em; margin: 0 0 0.85em; }
      `}</style>
    </div>
  )
}
