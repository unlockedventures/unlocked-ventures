'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Suspense, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from 'cn'

import type { NavItem } from '@/config/navigation'

import { DesktopMenu } from '@/components/site/navigation/desktop-menu'
import { MobileMenu } from '@/components/site/navigation/mobile-menu'
import {
  isNavItemSelected,
  navItemHasChildren,
  primaryItemClassName,
  primaryItemNameActiveClassName,
  primaryItemNameClassName,
  primaryItemOpenClassName,
  primaryItemSelectedClassName,
} from '@/components/site/navigation/nav-styles'

/** Small chevron; top edge aligns with nav label cap-height. */
function NavChevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 8"
      fill="none"
      className={cn(
        // Nudge up from vertical center so the icon sits on the cap line (14px / 22px)
        'h-[6px] w-[10px] shrink-0 -translate-y-[5px] text-current transition-transform duration-300 ease-out',
        open && 'rotate-180',
      )}
    >
      <path
        d="M1.25 1.75l4.75 4.5 4.75-4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SiteNavigation({
  items,
  cta,
  exploreLabel,
}: {
  items: readonly NavItem[]
  cta: { label: string; href: string }
  exploreLabel: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [activeHref, setActiveHref] = useState<string | null>(null)
  const closeTimer = useRef<number | null>(null)
  const suppressedHref = useRef<string | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const activeItem = items.find((item) => item.href === activeHref) ?? null

  const clearCloseTimer = () => {
    if (closeTimer.current === null) return
    window.clearTimeout(closeTimer.current)
    closeTimer.current = null
  }

  const pointerIsOverMenu = () =>
    Boolean(navRef.current?.matches(':hover') || panelRef.current?.matches(':hover'))

  const showMenu = (href: string) => {
    if (suppressedHref.current === href) return
    suppressedHref.current = null
    clearCloseTimer()
    setActiveHref(href)
  }

  const dismissMenu = (href: string) => {
    clearCloseTimer()
    suppressedHref.current = href
    setActiveHref(null)
  }

  const scheduleClose = () => {
    clearCloseTimer()
    closeTimer.current = window.setTimeout(() => {
      if (pointerIsOverMenu()) return
      setActiveHref(null)
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
    }
  }, [])

  useEffect(() => {
    setOpen(false)
    setActiveHref(null)
  }, [pathname])

  useEffect(() => {
    if (!activeHref) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveHref(null)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeHref])

  return (
    <>
      <nav
        ref={navRef}
        aria-label="Primary"
        className="mx-8 hidden h-full min-w-0 flex-1 items-stretch justify-center xl:flex"
        onMouseLeave={scheduleClose}
      >
        {items.map((item) => {
          const hasChildren = navItemHasChildren(item)
          const isOpen = activeHref === item.href
          const isSelected = isNavItemSelected(pathname, item)
          return (
            <div
              key={item.href}
              className="flex h-full cursor-pointer items-center px-3"
              onMouseEnter={() => {
                if (hasChildren) showMenu(item.href)
              }}
              onMouseLeave={() => {
                if (suppressedHref.current === item.href) suppressedHref.current = null
              }}
              onFocus={() => {
                if (hasChildren) showMenu(item.href)
              }}
            >
              <Link
                href={item.href}
                aria-current={isSelected ? 'page' : undefined}
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-haspopup={hasChildren ? 'menu' : undefined}
                className={cn(
                  'group/nav-item',
                  primaryItemClassName,
                  isOpen && primaryItemOpenClassName,
                  isSelected && primaryItemSelectedClassName,
                )}
                onMouseEnter={() => {
                  if (hasChildren) showMenu(item.href)
                }}
                onMouseDown={() => {
                  if (hasChildren) dismissMenu(item.href)
                }}
                onClick={() => {
                  if (hasChildren) dismissMenu(item.href)
                }}
              >
                <span
                  className={cn(
                    primaryItemNameClassName,
                    (isOpen || isSelected) && primaryItemNameActiveClassName,
                  )}
                >
                  {item.label}
                </span>
                {hasChildren ? <NavChevron open={isOpen} /> : null}
              </Link>
            </div>
          )
        })}
      </nav>
      {activeItem
        ? createPortal(
            <DesktopMenu
              item={activeItem}
              exploreLabel={exploreLabel}
              panelRef={panelRef}
              onEnter={() => showMenu(activeItem.href)}
              onLeave={scheduleClose}
              onClose={() => setActiveHref(null)}
            />,
            document.body,
          )
        : null}
      <button
        type="button"
        className="ml-auto inline-flex size-10 cursor-pointer items-center justify-center text-[#292F35] hover:text-[#292F35]/80 lg:size-11 xl:hidden"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X className="size-6 sm:size-7 lg:size-8" /> : <Menu className="size-6 sm:size-7 md:size-8 lg:size-9" />}
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
      </button>
      <Suspense fallback={null}>
        <MobileMenu items={items} cta={cta} open={open} onClose={() => setOpen(false)} />
      </Suspense>
    </>
  )
}
