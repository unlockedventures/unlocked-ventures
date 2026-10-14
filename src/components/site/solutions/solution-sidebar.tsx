'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

import type { NavGroup, NavItem } from '@/config/navigation'
import { cn } from '@/lib/utils'

export type SolutionSidebarSection = Pick<NavItem, 'label' | 'groups'>

export type SolutionSidebarProps = {
  sections: readonly SolutionSidebarSection[]
  activeHref: string
  className?: string
}

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn('size-5 shrink-0', className)}>
      <path
        d="M5.833 14.167L14.167 5.833M5.833 5.833H14.167V14.167"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SidebarGroup({
  group,
  activeHref,
  activeLinkRef,
}: {
  group: NavGroup
  activeHref: string
  activeLinkRef: React.RefObject<HTMLAnchorElement | null>
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      {group.title ? (
        <>
          <p className="font-sans text-xs leading-5 font-normal text-[rgba(51,53,63,0.7)] uppercase">
            {group.title}
          </p>
          <div aria-hidden="true" className="h-px w-full bg-black/12" />
        </>
      ) : null}
      <ul className="flex w-full flex-col">
        {group.links.map((link) => {
          const active = link.href === activeHref
          return (
            <li key={link.href}>
              <Link
                ref={active ? activeLinkRef : undefined}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex h-[50px] w-full items-center justify-between gap-3 px-5 font-sans text-base leading-8 font-normal transition-colors',
                  active
                    ? 'bg-[#33353F] text-white'
                    : 'text-[rgba(34,34,34,0.85)] opacity-80 hover:opacity-100',
                )}
              >
                <span className="min-w-0 truncate">{link.label}</span>
                <span
                  className={cn(
                    'inline-flex size-5 shrink-0 items-center justify-center rounded-full',
                    active ? 'text-white' : 'text-[#33353F] opacity-50',
                  )}
                >
                  <ArrowUpRight className="transition-transform duration-300 ease-out group-hover:rotate-45 group-focus-visible:rotate-45" />
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SidebarCategory({
  label,
  groups,
  activeHref,
  activeLinkRef,
}: {
  label: string
  groups: readonly NavGroup[]
  activeHref: string
  activeLinkRef: React.RefObject<HTMLAnchorElement | null>
}) {
  return (
    <div className="flex w-full flex-col gap-3.5">
      <h2 className="font-sans text-xl leading-8 font-normal text-[#33353F]">{label}</h2>
      <div aria-hidden="true" className="h-px w-full bg-black/12" />
      <div className="flex w-full flex-col gap-6">
        {groups.map((group, index) => (
          <SidebarGroup
            key={`${label}-${group.title ?? 'group'}-${index}`}
            group={group}
            activeHref={activeHref}
            activeLinkRef={activeLinkRef}
          />
        ))}
      </div>
    </div>
  )
}

export function SolutionSidebar({ sections, activeHref, className }: SolutionSidebarProps) {
  const scrollRef = useRef<HTMLElement>(null)
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    const activeLink = activeLinkRef.current
    const scroller = scrollRef.current
    if (!activeLink || !scroller) return

    const scrollerRect = scroller.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()
    const isVisible =
      linkRect.top >= scrollerRect.top + 8 && linkRect.bottom <= scrollerRect.bottom - 8

    if (!isVisible) {
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [activeHref])

  if (!sections.length) return null

  return (
    <nav
      ref={scrollRef}
      aria-label="Solutions"
      className={cn(
        'flex h-full max-h-[inherit] w-full flex-col items-start gap-8 overflow-y-auto overscroll-contain bg-[#F3F4F8] p-6',
        'scroll-smooth [scrollbar-gutter:stable]',
        '[&::-webkit-scrollbar]:w-1.5',
        '[&::-webkit-scrollbar-track]:bg-transparent',
        '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#33353F]/25',
        'hover:[&::-webkit-scrollbar-thumb]:bg-[#33353F]/40',
        className,
      )}
    >
      {sections.map((section) => (
        <SidebarCategory
          key={section.label}
          label={section.label}
          groups={section.groups}
          activeHref={activeHref}
          activeLinkRef={activeLinkRef}
        />
      ))}
    </nav>
  )
}
