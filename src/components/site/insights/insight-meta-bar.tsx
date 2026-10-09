'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

function NetworkShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn('size-4 shrink-0', className)}>
      <circle cx="18" cy="5" r="2.25" fill="currentColor" />
      <circle cx="6" cy="12" r="2.25" fill="currentColor" />
      <circle cx="18" cy="19" r="2.25" fill="currentColor" />
      <path
        d="M8.1 13.1 15.9 17.4M15.9 6.6 8.1 10.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

const outlineClassName =
  'inline-flex h-10 items-center justify-center gap-2 border border-[#C8CAD0] bg-white px-4 font-sans text-sm leading-5 font-normal text-[#484D56] transition-colors hover:border-[#484D56] hover:text-[#171616]'

export function InsightMetaBar({
  tags,
  title,
  shareLabel,
  url,
}: {
  tags: readonly string[]
  title: string
  shareLabel: string
  url: string
}) {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const shareNative = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        // Fall through to the menu when the user cancels or share is unavailable.
      }
    }
    setOpen((value) => !value)
  }

  if (tags.length === 0) return null

  return (
    <div className="mt-4 flex w-full flex-col gap-4 border-y border-[#E7E9F3] py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:mt-6 md:py-6">
      <ul className="flex flex-wrap gap-2.5 md:gap-3">
        {tags.map((tag) => (
          <li key={tag}>
            <span className={outlineClassName}>{tag}</span>
          </li>
        ))}
      </ul>

      <div ref={rootRef} className="relative self-start sm:self-auto">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={shareNative}
          className={outlineClassName}
        >
          <span>{shareLabel}</span>
          <NetworkShareIcon />
        </button>

        {open ? (
          <div
            id={menuId}
            role="menu"
            className="absolute top-full right-0 z-30 mt-2 min-w-[160px] border border-[#E7E9F3] bg-white py-1 shadow-lg"
          >
            <a
              role="menuitem"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 font-sans text-sm text-[#484D56] transition-colors hover:bg-[#F3F4F9] hover:text-[#171616]"
              onClick={() => setOpen(false)}
            >
              LinkedIn
            </a>
            <a
              role="menuitem"
              href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 font-sans text-sm text-[#484D56] transition-colors hover:bg-[#F3F4F9] hover:text-[#171616]"
              onClick={() => setOpen(false)}
            >
              X
            </a>
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2.5 text-left font-sans text-sm text-[#484D56] transition-colors hover:bg-[#F3F4F9] hover:text-[#171616]"
              onClick={() => {
                void copyLink()
                setOpen(false)
              }}
            >
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
