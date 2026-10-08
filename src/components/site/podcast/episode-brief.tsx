'use client'

import { useEffect, useId, useRef, useState } from 'react'

const about =
  'AI is already writing code, answering support tickets and drafting legal briefs. Three voices argue about what that means for the next ten years of work: which roles shrink, which grow, and which skills will still be worth paying for. We look at entry-level jobs, the rise of AI agents in business teams, and what workers in fast-growing markets like South Asia should do differently.'

const reading =
  'Our reading of the arguments presented in this episode highlights the key ideas, perspectives, and reasoning discussed throughout the conversation, offering a thoughtful interpretation of the main insights and viewpoints.'

const agree = [
  {
    title: 'Tasks disappear faster than jobs',
    body: 'Most roles will be reshaped long before they are removed. The work inside the job changes first.',
  },
  {
    title: 'Entry-level work is most exposed',
    body: 'Junior tasks like first drafts, data cleanup and basic QA are exactly what AI does well today.',
  },
  {
    title: 'Judgment becomes the premium skill',
    body: 'Knowing what to ask, what to trust and what to ship matters more when output is cheap.',
  },
]

const disagree = [
  {
    title: '“Everyone should learn to code”',
    body: 'Coding alone is losing value. Domain knowledge paired with AI tools is the stronger bet.',
  },
  {
    title: '“New jobs will replace old ones automatically”',
    body: 'They may, but not for the same people or in the same places without deliberate retraining.',
  },
  {
    title: '“Creative work is safe”',
    body: 'Creative roles are changing as fast as any other. Taste is safer; production work is not.',
  },
]

const take = [
  {
    title: 'Map your week',
    body: 'List the tasks you repeat every week and mark which ones an AI tool could draft for you today.',
  },
  {
    title: 'Pick one tool and go deep',
    body: 'Use one assistant daily for a month instead of trying ten. Depth beats a long tool list.',
  },
  {
    title: 'Show the result, not the tool',
    body: 'Share one workflow you sped up with your manager or clients. Measurable time saved is your new portfolio.',
  },
]

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

const transcript = [
  {
    time: '0:00',
    speaker: 'Saker Ghani',
    text: 'AI is already writing code, answering support tickets, and drafting legal briefs. Today we ask what that means for the next ten years of work: which roles shrink, which grow, and which skills will still be worth paying for.',
  },
  {
    time: '2:14',
    speaker: 'Maya Chen',
    text: 'The first thing I want to separate is tasks and jobs. Most roles will be reshaped long before they are removed. The work inside the job changes first. A title can stay on the org chart while the day-to-day work is already different.',
  },
  {
    time: '6:40',
    speaker: 'Omar Hassan',
    text: 'Entry-level work is the most exposed. First drafts, data cleanup, and basic QA are exactly what these tools do well today. If your first two years were built on that work, you need a new way to become useful.',
  },
  {
    time: '11:05',
    speaker: 'Saker Ghani',
    text: 'A line we keep hearing is that everyone should learn to code. I do not think that is the bet. Coding alone is losing value. Domain knowledge paired with AI tools is the stronger position.',
  },
  {
    time: '16:22',
    speaker: 'Maya Chen',
    text: 'Judgment becomes the premium skill. Knowing what to ask, what to trust, and what to ship matters more when output is cheap. Taste and review are harder to automate than production.',
  },
  {
    time: '21:48',
    speaker: 'Omar Hassan',
    text: 'People say new jobs will replace old ones automatically. They may, but not for the same people or in the same places without deliberate retraining. Waiting for the market to sort itself out is not a plan.',
  },
  {
    time: '27:10',
    speaker: 'Maya Chen',
    text: 'Creative work is not a safe harbor either. Creative roles are changing as fast as any other. Taste is safer. Production work is not.',
  },
  {
    time: '32:36',
    speaker: 'Saker Ghani',
    text: 'The safest career move is not avoiding AI. It is becoming the person on your team who knows how to put it to work. Map the tasks you repeat, pick one tool and use it daily, and show the result. Measurable time saved is the new portfolio.',
  },
]

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
  lines,
  onClose,
}: {
  open: boolean
  title: string
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
      className="m-auto w-[min(40rem,calc(100vw-2rem))] max-h-[min(40rem,calc(100vh-4rem))] overflow-hidden rounded-lg border border-[#171616]/10 bg-white p-0 text-[#171616] shadow-xl open:flex open:flex-col backdrop:bg-[#171616]/40"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#171616]/10 px-6 py-4">
        <div className="min-w-0">
          <h2 id={titleId} className="font-sans text-lg leading-7 font-medium text-[#171616]">
            Transcript
          </h2>
          <p className="mt-1 truncate font-sans text-sm leading-5 text-[#696969]">{title}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#484D56] hover:bg-[#F3F4F9]"
          aria-label="Close transcript"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="max-h-[calc(min(40rem,100vh-4rem)-5.5rem)] overflow-y-auto px-6 py-2">
        <ol>
          {lines.map((line) => (
            <li key={line.time} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-b border-[#171616]/10 py-4 last:border-b-0">
              <time className="font-sans text-sm leading-6 text-[#696969] tabular-nums">{line.time}</time>
              <div className="min-w-0">
                <p className="font-sans text-sm leading-6 font-medium text-[#171616]">{line.speaker}</p>
                <p className="mt-1 font-sans text-sm leading-6 text-[#33353F]">{line.text}</p>
              </div>
            </li>
          ))}
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
  about: aboutText,
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
  about?: string
  reading?: string
  agree?: { title: string; body: string }[]
  disagree?: { title: string; body: string }[]
  takeIntro?: string
  take?: { title: string; body: string }[]
  transcript?: { time: string; speaker: string; text: string }[]
}) {
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const transcriptId = useId()
  const aboutCopy = aboutText?.trim() || about
  const readingCopy = readingText?.trim() || reading
  const agreeCopy = agreeItems?.length ? agreeItems : agree
  const disagreeCopy = disagreeItems?.length ? disagreeItems : disagree
  const takeCopy = takeItems?.length ? takeItems : take
  const takeLead =
    takeIntro?.trim() ||
    "The safest career move isn't avoiding AI. It's becoming the person on your team who knows how to put it to work. Here is what we'd do this year."
  const lines = transcriptLines?.length ? transcriptLines : transcript

  return (
    <section>
      <div className="flex items-center justify-between gap-4 border-b border-[#171616]/10 pb-4">
        <div className="flex items-center gap-6 sm:gap-8">
          <Action label={shareLabel || 'Share'} icon={<ShareIcon />} />
          <Action label={saveLabel || 'Save'} icon={<SaveIcon />} />
          <Action label={likeLabel || 'Like'} icon={<LikeIcon />} />
        </div>
        <Action
          label="Transcript"
          icon={<TranscriptIcon />}
          expanded={transcriptOpen}
          controls={transcriptId}
          onClick={() => setTranscriptOpen((open) => !open)}
        />
      </div>

      <div id={transcriptId}>
        <TranscriptDialog open={transcriptOpen} title={title} lines={lines} onClose={() => setTranscriptOpen(false)} />
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <h2 className="font-sans text-[2rem] leading-10 font-normal text-[#171616]">About this episode</h2>
        <p className="font-sans text-base leading-7 font-normal text-[#696969]">{aboutCopy}</p>
      </div>

      <div className="mt-10 border-t border-[#171616]/10 pt-10">
        <div className="flex flex-col gap-4">
          <h2 className="font-sans text-[2rem] leading-10 font-normal text-[#171616]">
            Where we agree and where we don&apos;t
          </h2>
          <p className="font-sans text-base leading-7 font-normal text-[#696969]">{readingCopy}</p>
        </div>

          <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-8">
            <StanceList
              tone="agree"
              title="We agree"
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M3.5 9.25 7 12.75 14.5 5.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              items={agreeCopy}
            />
            <StanceList
              tone="disagree"
              title="We disagree"
              icon={
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M4.5 4.5 13.5 13.5M13.5 4.5 4.5 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              }
              items={disagreeCopy}
            />
          </div>
      </div>

      <div className="mt-10 border-t border-[#171616]/10 pt-10">
        <div className="flex max-w-[820px] flex-col gap-4">
          <h2 className="font-sans text-[2rem] leading-10 font-normal text-[#171616]">The Unlocked Ventures take</h2>
          <p className="font-sans text-base leading-7 font-normal text-[#696969]">{takeLead}</p>
        </div>
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
      </div>
    </section>
  )
}
