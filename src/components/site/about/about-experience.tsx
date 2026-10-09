'use client'

import { useId, useState } from 'react'

import type { AboutExperienceRole } from '@/components/site/about/about-content'
import { cn } from '@/lib/utils'

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={className}>
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 6.5h12" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5.5 2v2M10.5 2v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ToggleIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="relative flex size-6 shrink-0 items-center justify-center text-[#33353F]"
    >
      <span className="absolute h-px w-3.5 bg-current" />
      <span
        className={cn(
          'absolute h-3.5 w-px bg-current transition-transform duration-200 ease-out',
          open && 'scale-y-0',
        )}
      />
    </span>
  )
}

export function AboutExperience({
  title,
  roles,
}: {
  title: string
  roles: readonly AboutExperienceRole[]
}) {
  const baseId = useId()
  const [openIndex, setOpenIndex] = useState(() => {
    const preferred = roles.findIndex((role) => role.defaultOpen)
    return preferred >= 0 ? preferred : 0
  })

  if (!roles.length) return null

  return (
    <section id="experience" className="scroll-mt-24 bg-[#F3F4F9] py-16 md:py-20 xl:py-[100px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-10 px-4 sm:px-6 md:gap-12 md:px-8 lg:px-12 xl:gap-[72px] xl:px-[156px]">
        <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px]">
          {title}
        </h2>

        <ul className="flex w-full flex-col gap-3 sm:gap-4">
          {roles.map((role, index) => {
            const open = openIndex === index
            const panelId = `${baseId}-panel-${index}`
            const triggerId = `${baseId}-trigger-${index}`

            return (
              <li key={`${role.role}-${role.company}-${role.dateLabel}`} className="rounded-lg bg-white">
                <button
                  type="button"
                  id={triggerId}
                  aria-expanded={open}
                  aria-controls={open ? panelId : undefined}
                  className="flex w-full cursor-pointer items-start gap-3 px-5 py-5 text-left sm:gap-4 sm:px-6 sm:py-6 md:items-center md:gap-6"
                  onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-sans text-lg leading-7 font-normal text-[#33353F] sm:text-xl sm:leading-7">
                      {role.role}
                    </p>
                    <p className="mt-1 font-sans text-sm leading-5 font-normal text-[#696969] sm:text-base sm:leading-6">
                      {role.company}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    <span className="inline-flex max-w-[11.5rem] items-center gap-1.5 rounded-md bg-[#F3F4F9] px-2.5 py-1.5 font-sans text-[11px] leading-4 font-normal text-[#484D56] sm:max-w-none sm:gap-2 sm:px-3 sm:py-2 sm:text-sm sm:leading-5">
                      <CalendarIcon className="size-3.5 shrink-0 sm:size-4" />
                      <span className="truncate">{role.dateLabel}</span>
                    </span>
                    <ToggleIcon open={open} />
                  </div>
                </button>

                {open && (role.summary || role.highlights.length > 0) ? (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    className="flex flex-col gap-4 border-t border-[#E8E9EE] px-5 pt-4 pb-5 sm:gap-5 sm:px-6 sm:pt-5 sm:pb-6"
                  >
                    {role.summary ? (
                      <p className="font-sans text-base leading-6 font-normal text-[#222222]">
                        {role.summary}
                      </p>
                    ) : null}
                    {role.highlights.length > 0 ? (
                      <ul className="flex flex-col gap-3">
                        {role.highlights.map((item) => (
                          <li
                            key={item}
                            className="flex gap-3 font-sans text-base leading-6 font-normal text-[#222222]"
                          >
                            <span
                              aria-hidden="true"
                              className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#696969]"
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
