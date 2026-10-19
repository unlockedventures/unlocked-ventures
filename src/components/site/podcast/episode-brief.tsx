'use client'

import { useEffect, useId, useRef, useState } from 'react'

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7.15833 8.74183L12.85 5.42516M12.8417 14.5752L7.15833 11.2585M17.5 15.8335C17.5 14.4528 16.3807 13.3335 15 13.3335C13.6193 13.3335 12.5 14.4528 12.5 15.8335C12.5 17.2142 13.6193 18.3335 15 18.3335C16.3807 18.3335 17.5 17.2142 17.5 15.8335ZM7.5 10.0002C7.5 8.61945 6.38071 7.50016 5 7.50016C3.61929 7.50016 2.5 8.61945 2.5 10.0002C2.5 11.3809 3.61929 12.5002 5 12.5002C6.38071 12.5002 7.5 11.3809 7.5 10.0002ZM17.5 4.16683C17.5 2.78612 16.3807 1.66683 15 1.66683C13.6193 1.66683 12.5 2.78612 12.5 4.16683C12.5 5.54754 13.6193 6.66683 15 6.66683C16.3807 6.66683 17.5 5.54754 17.5 4.16683Z"
        stroke="currentColor"
        strokeWidth="0.833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M14.1667 2.5L14.1667 9.16667H5.83333L5.83333 2.5M5.83333 17.5V13.3333H12.5M15.8333 2.5H4.16667C3.72464 2.5 3.30072 2.6756 2.98816 2.98816C2.67559 3.30072 2.5 3.72464 2.5 4.16667L2.5 15.8333C2.5 16.2754 2.67559 16.6993 2.98816 17.0118C3.30072 17.3244 3.72464 17.5 4.16667 17.5H13.3333L17.5 13.3333V4.16667C17.5 3.72464 17.3244 3.30072 17.0118 2.98816C16.6993 2.6756 16.2754 2.5 15.8333 2.5Z"
        stroke="currentColor"
        strokeWidth="0.833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LikeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5.83366 9.1665L9.16699 1.6665C9.83003 1.6665 10.4659 1.9299 10.9348 2.39874C11.4036 2.86758 11.667 3.50346 11.667 4.1665V7.49984H16.3837C16.6252 7.4971 16.8645 7.54692 17.085 7.64585C17.3054 7.74478 17.5017 7.89045 17.6602 8.07277C17.8187 8.25508 17.9357 8.46969 18.0031 8.70171C18.0705 8.93374 18.0866 9.17763 18.0503 9.4165L16.9003 16.9165C16.8401 17.3139 16.6382 17.6762 16.3319 17.9365C16.0256 18.1968 15.6356 18.3377 15.2337 18.3332H5.83366M5.83366 9.1665V18.3332M5.83366 9.1665H3.33366C2.89163 9.1665 2.46771 9.3421 2.15515 9.65466C1.84259 9.96722 1.66699 10.3911 1.66699 10.8332L1.66699 16.6665C1.66699 17.1085 1.84259 17.5325 2.15515 17.845C2.46771 18.1576 2.89163 18.3332 3.33366 18.3332H5.83366"
        stroke="currentColor"
        strokeWidth="0.833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TranscriptIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10.0003 5.83333C10.0003 4.94928 9.64914 4.10143 9.02401 3.47631C8.39889 2.85119 7.55105 2.5 6.66699 2.5L1.66699 2.5L1.66699 15H7.50033C8.16337 15 8.79925 15.2634 9.26809 15.7322C9.73693 16.2011 10.0003 16.837 10.0003 17.5M10.0003 5.83333L10.0003 17.5M10.0003 5.83333C10.0003 4.94928 10.3515 4.10143 10.9766 3.47631C11.6018 2.85119 12.4496 2.5 13.3337 2.5H18.3337V15L12.5003 15C11.8373 15 11.2014 15.2634 10.7326 15.7322C10.2637 16.2011 10.0003 16.837 10.0003 17.5"
        stroke="currentColor"
        strokeWidth="0.833"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Action({
  label,
  icon,
  expanded,
  controls,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  expanded?: boolean
  controls?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-2 font-sans text-sm leading-5 font-normal ${expanded ? 'text-[#171616]' : 'text-[#484D56]'}`}
    >
      {icon}
      {label}
    </button>
  )
}

function StanceList({
  tone,
  title,
  icon,
  items,
}: {
  tone: 'agree' | 'disagree'
  title: string
  icon: React.ReactNode
  items: { title: string; body: string }[]
}) {
  const color = tone === 'agree' ? 'text-[#13A139]' : 'text-[#FF3B30]'
  const rule = tone === 'agree' ? 'border-[#13A139]' : 'border-[#FF3B30]'

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <h3 className={`inline-flex items-center gap-2 font-sans text-lg leading-7 font-medium ${color}`}>
        {icon}
        {title}
      </h3>
      <ul className="flex flex-col gap-6">
        {items.map((item) => (
          <li key={item.title} className={`border-l-2 ${rule} pl-4`}>
            <p className="font-sans text-base leading-6 font-medium text-[#171616]">{item.title}</p>
            <p className="mt-1 font-sans text-sm leading-6 font-normal text-[#696969]">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TranscriptDialog({
  open,
  title,
  dialogTitle,
  closeLabel,
  lines,
  onClose,
}: {
  open: boolean
  title: string
  dialogTitle: string
  closeLabel: string
  lines: { time: string; speaker: string; text: string }[]
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
      className="m-auto w-[min(36rem,calc(100vw-2rem))] max-h-[min(42rem,calc(100vh-3rem))] overflow-hidden rounded-2xl border-0 bg-white p-0 text-[#171616] shadow-[0_24px_64px_rgba(23,22,22,0.18)] open:flex open:flex-col backdrop:bg-[#171616]/45"
    >
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 sm:px-8 sm:pt-8">
        <div className="min-w-0 pr-2">
          <h2 id={titleId} className="font-sans text-[1.75rem] leading-9 font-semibold tracking-tight text-[#171616]">
            {dialogTitle}
          </h2>
          <p className="mt-1 font-sans text-base leading-6 font-normal text-[#8A8F98]">{title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#8A8F98] transition-colors hover:bg-[#F3F4F9] hover:text-[#171616]"
          aria-label={closeLabel}
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="max-h-[calc(min(42rem,100vh-3rem)-7rem)] overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8">
        <ol className="divide-y divide-[#E8EAED]">
          {lines.map((line, index) => {
            const timeLabel = line.time?.trim() && line.time.trim() !== '—' ? line.time.trim() : ''
            return (
              <li
                key={`${index}-${line.time}-${line.speaker}`}
                className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-5 gap-y-1 py-5 first:pt-2 last:pb-0 sm:grid-cols-[3.75rem_minmax(0,1fr)]"
              >
                <time
                  className="pt-0.5 font-sans text-sm leading-6 font-medium text-[#9AA0A6] tabular-nums"
                  dateTime={timeLabel || undefined}
                >
                  {timeLabel || '\u00A0'}
                </time>
                <div className="min-w-0">
                  <p className="font-sans text-base leading-6 font-semibold text-[#171616]">{line.speaker}</p>
                  <p className="mt-1.5 font-sans text-[0.95rem] leading-7 font-normal text-[#3C4048] whitespace-pre-line">
                    {line.text}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </dialog>
  )
}

export function EpisodeBrief({
  title,
  shareLabel,
  saveLabel,
  likeLabel,
  transcriptLabel,
  transcriptDialogTitle,
  closeTranscriptLabel,
  aboutTitle,
  mainPointsTitle,
  stanceTitle,
  agreeTitle,
  disagreeTitle,
  takeTitle,
  details,
  about: aboutText,
  summary: summaryText,
  mainPoints: mainPointItems,
  reading: readingText,
  agree: agreeItems,
  disagree: disagreeItems,
  takeIntro,
  take: takeItems,
  transcript: transcriptLines,
}: {
  title: string
  shareLabel: string
  saveLabel: string
  likeLabel: string
  transcriptLabel: string
  transcriptDialogTitle: string
  closeTranscriptLabel: string
  aboutTitle: string
  mainPointsTitle: string
  stanceTitle: string
  agreeTitle: string
  disagreeTitle: string
  takeTitle: string
  details?: {
    guest?: string
    topic?: string
    duration?: string
  } | null
  about?: string
  summary?: string
  mainPoints?: string[]
  reading?: string
  agree?: { title: string; body: string }[]
  disagree?: { title: string; body: string }[]
  takeIntro?: string
  take?: { title: string; body: string }[]
  transcript?: { time: string; speaker: string; text: string }[]
}) {
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const transcriptId = useId()
  const aboutCopy = (summaryText?.trim() || aboutText?.trim() || '')
  const mainPointsCopy = (mainPointItems ?? []).map((point) => point.trim()).filter(Boolean)
  const readingCopy = readingText?.trim() ?? ''
  const agreeCopy = agreeItems ?? []
  const disagreeCopy = disagreeItems ?? []
  const takeCopy = takeItems ?? []
  const takeLead = takeIntro?.trim() ?? ''
  const lines = transcriptLines ?? []
  const showStance = Boolean(readingCopy || agreeCopy.length || disagreeCopy.length)
  const showTake = Boolean(takeLead || takeCopy.length)

  return (
    <section>
      <div className="flex items-center justify-between gap-4 border-b border-[#171616]/10 pb-4">
        <div className="flex items-center gap-6 sm:gap-8">
          {shareLabel ? <Action label={shareLabel} icon={<ShareIcon />} /> : null}
          {saveLabel ? <Action label={saveLabel} icon={<SaveIcon />} /> : null}
          {likeLabel ? <Action label={likeLabel} icon={<LikeIcon />} /> : null}
        </div>
        {transcriptLabel && lines.length ? (
          <Action
            label={transcriptLabel}
            icon={<TranscriptIcon />}
            expanded={transcriptOpen}
            controls={transcriptId}
            onClick={() => setTranscriptOpen((open) => !open)}
          />
        ) : null}
      </div>

      {lines.length ? (
        <div id={transcriptId}>
          <TranscriptDialog
            open={transcriptOpen}
            title={title}
            dialogTitle={transcriptDialogTitle}
            closeLabel={closeTranscriptLabel}
            lines={lines}
            onClose={() => setTranscriptOpen(false)}
          />
        </div>
      ) : null}

      {details && (details.guest || details.topic || details.duration) ? (
        <div className="mt-10 flex flex-col gap-3 border-b border-[#171616]/10 pb-10">
          {details.topic ? (
            <div className="flex flex-col gap-2 rounded-xl bg-[#F5F6F8] px-5 py-4">
              <p className="font-sans text-[11px] leading-4 font-medium tracking-[0.1em] text-[#8A8F98] uppercase">
                Topic
              </p>
              <p className="max-w-prose font-sans text-base leading-7 font-normal whitespace-pre-line text-[#2A2D33] sm:text-[17px] sm:leading-8">
                {details.topic}
              </p>
            </div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {details.guest ? (
              <div className="flex min-h-[5.5rem] flex-col gap-2 rounded-xl bg-[#F5F6F8] px-5 py-4">
                <p className="font-sans text-[11px] leading-4 font-medium tracking-[0.1em] text-[#8A8F98] uppercase">
                  Guest name
                </p>
                <p className="font-sans text-base leading-6 font-medium tracking-[-0.01em] text-[#171616] sm:text-[17px] sm:leading-7">
                  {details.guest}
                </p>
              </div>
            ) : null}
            {details.duration ? (
              <div className="flex min-h-[5.5rem] flex-col gap-2 rounded-xl bg-[#F5F6F8] px-5 py-4">
                <p className="font-sans text-[11px] leading-4 font-medium tracking-[0.1em] text-[#8A8F98] uppercase">
                  Duration
                </p>
                <p className="font-sans text-base leading-6 font-medium tracking-[-0.01em] text-[#171616] tabular-nums sm:text-[17px] sm:leading-7">
                  {details.duration}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {aboutCopy && aboutTitle ? (
        <div className="mt-10 flex flex-col gap-4">
          <h2 className="font-sans text-[2rem] leading-10 font-normal text-[#171616]">{aboutTitle}</h2>
          <p className="font-sans text-base leading-7 font-normal whitespace-pre-line text-[#696969]">{aboutCopy}</p>
        </div>
      ) : null}

      {mainPointsCopy.length > 0 && mainPointsTitle ? (
        <div className="mt-10 flex flex-col gap-4 border-t border-[#171616]/10 pt-10">
          <h2 className="font-sans text-[2rem] leading-10 font-normal text-[#171616]">{mainPointsTitle}</h2>
          <ul className="flex flex-col gap-3">
            {mainPointsCopy.map((point) => (
              <li key={point} className="flex gap-3">
                <span
                  className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#171616]"
                  aria-hidden="true"
                />
                <p className="font-sans text-base leading-7 font-normal text-[#696969]">{point}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {showStance && stanceTitle ? (
        <div className="mt-10 border-t border-[#171616]/10 pt-10">
          <div className="flex flex-col gap-4">
            <h2 className="font-sans text-[2rem] leading-10 font-normal text-[#171616]">{stanceTitle}</h2>
            {readingCopy ? (
              <p className="font-sans text-base leading-7 font-normal text-[#696969]">{readingCopy}</p>
            ) : null}
          </div>

          <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-8">
            {agreeCopy.length && agreeTitle ? (
              <StanceList
                tone="agree"
                title={agreeTitle}
                icon={
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M3.5 9.25 7 12.75 14.5 5.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                }
                items={agreeCopy}
              />
            ) : null}
            {disagreeCopy.length && disagreeTitle ? (
              <StanceList
                tone="disagree"
                title={disagreeTitle}
                icon={
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                }
                items={disagreeCopy}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {showTake && takeTitle ? (
        <div className="mt-10 border-t border-[#171616]/10 pt-10 mb-10">
          <div className="flex max-w-[820px] flex-col gap-4">
            <h2 className="font-sans text-[2rem] leading-10 font-normal text-[#171616]">{takeTitle}</h2>
            {takeLead ? (
              <p className="font-sans text-base leading-7 font-normal text-[#696969]">{takeLead}</p>
            ) : null}
          </div>
          {takeCopy.length ? (
            <ol className="mt-8 flex flex-col border-t border-[#171616]/10">
              {takeCopy.map((step, index) => (
                <li key={step.title} className="flex gap-4 border-b border-[#171616]/10 py-6">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#171616]/30 font-sans text-sm leading-5 text-[#171616]">
                    {index + 1}
                  </span>
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="font-sans text-base leading-6 font-medium text-[#171616]">{step.title}</p>
                    <p className="font-sans text-sm leading-6 font-normal text-[#696969]">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
