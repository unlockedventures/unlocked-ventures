'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'

import type { NavGroup, NavItem } from '@/config/navigation'
import { cn } from '@/lib/utils'

export type SolutionSidebarSection = Pick<NavItem, 'label' | 'groups'>

export type SolutionSidebarProps = {
  sections: readonly SolutionSidebarSection[]
  activeHref: string
  className?: string
}

const DESKTOP_MQ = '(min-width: 1280px)'

function useIsDesktop() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia(DESKTOP_MQ)
      media.addEventListener('change', onStoreChange)
      return () => media.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia(DESKTOP_MQ).matches,
    () => true,
  )
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

function findActiveLabel(sections: readonly SolutionSidebarSection[], activeHref: string) {
  for (const section of sections) {
    for (const group of section.groups) {
      const match = group.links.find((link) => link.href === activeHref)
      if (match) return match.label
    }
  }
  return null
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
    <div className="flex w-full flex-col gap-2.5">
      {group.title ? (
        <p className="px-4 font-sans text-[11px] leading-4 font-medium tracking-[0.08em] text-[rgba(51,53,63,0.65)] uppercase">
          {group.title}
        </p>
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
                  'group flex min-h-11 w-full items-center justify-between gap-3 px-4 py-2.5 font-sans text-[15px] leading-6 font-normal transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1CACAE]',
                  active
                    ? 'bg-[#33353F] text-white'
                    : 'text-[rgba(34,34,34,0.85)] hover:bg-[#33353F]/6 hover:text-[#222222]',
                )}
              >
                <span className="min-w-0 flex-1 break-words text-left">{link.label}</span>
                <span
                  className={cn(
                    'inline-flex size-5 shrink-0 items-center justify-center',
                    active ? 'text-white' : 'text-[#33353F]/45 group-hover:text-[#33353F]/70',
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
    <section className="flex w-full flex-col gap-3">
      <h2 className="px-4 font-sans text-lg leading-7 font-medium text-[#33353F]">{label}</h2>
      <div className="flex w-full flex-col gap-5">
        {groups.map((group, index) => (
          <SidebarGroup
            key={`${label}-${group.title ?? 'group'}-${index}`}
            group={group}
            activeHref={activeHref}
            activeLinkRef={activeLinkRef}
          />
        ))}
      </div>
    </section>
  )
}

/**
 * Solutions sidebar:
 * - Mobile: compact trigger; options panel overlays page content
 * - Desktop: sticky column with internal scroll
 */
export function SolutionSidebar({ sections, activeHref, className }: SolutionSidebarProps) {
  const isDesktop = useIsDesktop()
  const panelId = useId()
  const rootRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeLabel = findActiveLabel(sections, activeHref)
  const showNav = isDesktop || mobileOpen

  useEffect(() => {
    setMobileOpen(false)
  }, [activeHref])

  useEffect(() => {
    if (!mobileOpen || isDesktop) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target || rootRef.current?.contains(target)) return
      setMobileOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileOpen, isDesktop])

  useEffect(() => {
    const activeLink = activeLinkRef.current
    const scroller = isDesktop ? rootRef.current : panelRef.current
    if (!activeLink || !scroller || !showNav) return

    const scrollerRect = scroller.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()
    const visible =
      linkRect.top >= scrollerRect.top + 8 && linkRect.bottom <= scrollerRect.bottom - 8

    if (!visible) {
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [activeHref, showNav, isDesktop])

  if (!sections.length) return null

  return (
    <aside
      ref={rootRef}
      className={cn(
        'relative z-20 w-full',
        'xl:sticky xl:top-24 xl:z-0 xl:max-h-[calc(100dvh-6.5rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:bg-[#F3F4F8]',
        'xl:scroll-smooth xl:[scrollbar-gutter:stable]',
        'xl:[&::-webkit-scrollbar]:w-1.5 xl:[&::-webkit-scrollbar-track]:bg-transparent',
        'xl:[&::-webkit-scrollbar-thumb]:rounded-full xl:[&::-webkit-scrollbar-thumb]:bg-[#33353F]/25',
        'xl:hover:[&::-webkit-scrollbar-thumb]:bg-[#33353F]/40',
        className,
      )}
    >
      {mobileOpen && !isDesktop ? (
        <button
          type="button"
          aria-label="Close solutions menu"
          className="fixed inset-0 z-10 cursor-default bg-black/20 xl:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="relative z-20 bg-[#F3F4F8] xl:bg-transparent">
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls={panelId}
          onClick={() => setMobileOpen((open) => !open)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left xl:hidden"
        >
          <span className="min-w-0">
            <span className="block font-sans text-[11px] leading-4 font-medium tracking-[0.08em] text-[rgba(51,53,63,0.65)] uppercase">
              Solutions
            </span>
            <span className="mt-0.5 block font-sans text-base leading-6 font-medium text-[#33353F]">
              {activeLabel ?? 'Browse solutions'}
            </span>
          </span>
          <ChevronDown
            aria-hidden
            className={cn(
              'size-5 shrink-0 text-[#33353F] transition-transform duration-200',
              mobileOpen && 'rotate-180',
            )}
          />
        </button>

        <nav
          id={panelId}
          ref={panelRef}
          aria-label="Solutions"
          hidden={!showNav}
          className={cn(
            'flex w-full flex-col gap-8 bg-[#F3F4F8] py-5',
            // Mobile: overlay the page content instead of pushing it down
            'absolute inset-x-0 top-full z-30 max-h-[min(70dvh,32rem)] overflow-y-auto overscroll-contain border border-[#33353F]/10 shadow-[0_16px_40px_-20px_rgba(17,24,39,0.45)]',
            'xl:static xl:max-h-none xl:overflow-visible xl:border-0 xl:shadow-none',
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
      </div>
    </aside>
  )
}
