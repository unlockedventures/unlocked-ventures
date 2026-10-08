'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { Suspense, useEffect, useRef } from 'react'
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
import { useNavStore } from '@/stores/nav-store'

/**
 * Sized to 1cap (capital letter height) and self-end so the extra ascent
 * above caps is excluded — icon centers between cap-top and baseline.
 */
function NavChevron({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-flex pb-[0.55cap] w-[0.75em] shrink-0 items-center justify-center self-end"
    >
      <svg
        viewBox="0 0 10 6"
        fill="none"
        className={cn(
          'block h-[0.55cap] w-full text-current transition-transform duration-300 ease-out',
          open && 'rotate-180',
        )}
      >
        <path
          d="M1 1.25 5 4.75 9 1.25"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
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
  const open = useNavStore((state) => state.open)
  const activeHref = useNavStore((state) => state.activeHref)
  const setOpen = useNavStore((state) => state.setOpen)
  const setActiveHref = useNavStore((state) => state.setActiveHref)
  const toggleOpen = useNavStore((state) => state.toggleOpen)
  const toggleActiveHref = useNavStore((state) => state.toggleActiveHref)
  const reset = useNavStore((state) => state.reset)
  const panelRef = useRef<HTMLDivElement>(null)
  const activeItem = items.find((item) => item.href === activeHref) ?? null

  useEffect(() => {
    reset()
  }, [pathname, reset])

  useEffect(() => {
    if (!activeHref) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveHref(null)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeHref, setActiveHref])

  return (
    <>
      <nav aria-label="Primary" className="mx-8 hidden h-full min-w-0 flex-1 items-stretch justify-center xl:flex">
        {items.map((item) => {
          const hasChildren = navItemHasChildren(item)
          const isOpen = activeHref === item.href
          const isSelected = isNavItemSelected(pathname, item)
          return (
            <div key={item.href} className="flex h-full cursor-pointer items-center px-3">
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
                onClick={(event) => {
                  if (!hasChildren) return
                  event.preventDefault()
                  toggleActiveHref(item.href)
                }}
                onKeyDown={(event) => {
                  if (!hasChildren) return
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  toggleActiveHref(item.href)
                }}
              >
                <span
                  className={cn(
                    primaryItemNameClassName,
                    (isOpen || isSelected) && primaryItemNameActiveClassName,
                  )}
                >
                  <span className="inline-flex items-center gap-1 leading-none">
                    {item.label}
                    {hasChildren ? <NavChevron open={isOpen} /> : null}
                  </span>
                </span>
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
        onClick={() => toggleOpen()}
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
