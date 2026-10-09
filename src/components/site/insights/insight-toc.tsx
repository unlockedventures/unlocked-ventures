'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

function tocLabel(title: string) {
  return title.replace(/^\d+\.\s*/, '')
}

export function InsightToc({
  title,
  headings,
}: {
  title: string
  headings: readonly { id: string; title: string }[]
}) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '')

  useEffect(() => {
    if (headings.length === 0) return

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((node): node is HTMLElement => Boolean(node))

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        const topMost = visible[0]?.target.id
        if (topMost) setActiveId(topMost)
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 1],
      },
    )

    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className="flex w-full flex-col items-start gap-4">
      <p className="font-sans text-base leading-6 font-normal text-[#171616]">{title}</p>
      <div className="h-px w-full bg-[#E7E9F3]" aria-hidden="true" />
      <nav aria-label={title} className="w-full">
        <ol className="flex flex-col border-l border-[#E7E9F3]">
          {headings.map((heading) => {
            const active = heading.id === activeId
            return (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    '-ml-px block border-l-2 py-2.5 pl-4 font-sans text-sm leading-6 font-normal transition-colors',
                    active
                      ? 'border-[#171616] text-[#171616]'
                      : 'border-transparent text-[#484D56] hover:text-[#171616]',
                  )}
                  onClick={() => setActiveId(heading.id)}
                >
                  {tocLabel(heading.title)}
                </a>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
