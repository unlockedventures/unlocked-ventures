'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import type { NavItem } from '@/config/navigation'

import { useHeaderMenuScroll } from '@/components/site/header/header-shell'
import { NavAnchor } from '@/components/site/navigation/nav-link'
import { SiteOutlineButton } from '@/components/site/site-outline-button'

const parentLabelClassName =
  'font-sans text-base leading-6 font-semibold tracking-normal text-[#292F35] antialiased'

const categoryClassName =
  'mb-2 font-sans text-[11px] leading-4 font-medium tracking-[0.14em] text-[#1CACAE] uppercase'

const childLinkClassName =
  'cursor-pointer font-sans text-sm leading-5 text-[#33353F] transition-colors hover:text-[#1CACAE]'

function isSamePage(href: string) {
  const next = new URL(href, window.location.href)
  return (
    next.pathname === window.location.pathname &&
    next.search === window.location.search &&
    next.hash === window.location.hash
  )
}

export function MobileMenu({
  items,
  cta,
  open,
  onClose,
}: {
  items: readonly NavItem[]
  cta: { label: string; href: string }
  open: boolean
  onClose: () => void
}) {
  const setMenuScrolled = useHeaderMenuScroll()
  const panelRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const route = `${pathname}?${searchParams?.toString() ?? ''}`
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    onCloseRef.current()
  }, [route])

  useEffect(() => {
    const onHashChange = () => onCloseRef.current()
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!open) setMenuScrolled(false)
    return () => setMenuScrolled(false)
  }, [open, setMenuScrolled])

  if (!open) return null

  return (
    <div
      id="mobile-navigation"
      className="absolute inset-x-0 top-full z-50 flex max-h-[calc(100dvh-3.5rem)] flex-col border-b border-[#C8CAD0] bg-white sm:max-h-[calc(100dvh-4rem)] md:max-h-[calc(100dvh-72px)] lg:max-h-[calc(100dvh-5rem)] xl:hidden"
    >
      <div
        ref={panelRef}
        className="min-h-0 flex-1 overflow-y-auto"
        onScroll={() => setMenuScrolled((panelRef.current?.scrollTop ?? 0) > 0)}
      >
        <ul className="mx-auto flex w-full flex-col px-4 py-2 sm:px-6 md:px-8 xl:px-14">
        {items.map((item) => (
          <li key={item.href} className="py-4">
            <p className={parentLabelClassName}>{item.label}</p>
            <div className="mt-3 flex flex-col gap-4 pl-4">
              {item.groups.map((group) => (
                <div key={group.title ?? item.href}>
                  {group.title ? <p className={categoryClassName}>{group.title}</p> : null}
                  <ul className={group.title ? 'flex flex-col gap-2 pl-3' : 'flex flex-col gap-2'}>
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <NavAnchor
                          link={link}
                          onNavigate={() => {
                            if (link.external || isSamePage(link.href)) onClose()
                          }}
                          className={childLinkClassName}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </li>
        ))}
        </ul>
      </div>
      <div className="mx-auto w-full shrink-0 border-t border-[#E4E7EE] px-4 py-4 sm:px-6 md:px-8 xl:px-14">
        <SiteOutlineButton
          href={cta.href}
          text={cta.label}
          hoverArrow
          className="w-full"
          onClick={() => {
            if (isSamePage(cta.href)) onClose()
          }}
        />
      </div>
    </div>
  )
}
