'use client'

import { useLayoutEffect, useRef, useState, type RefObject } from 'react'

import type { NavItem } from '@/config/navigation'
import { cn } from 'cn'

import { NavAnchor } from '@/components/site/navigation/nav-link'

export function DesktopMenu({
  item,
  exploreLabel,
  panelRef,
  onClose,
}: {
  item: NavItem
  exploreLabel: string
  panelRef: RefObject<HTMLDivElement | null>
  onClose: () => void
}) {
  const linksSlotRef = useRef<HTMLDivElement>(null)
  const [linksPad, setLinksPad] = useState(0)

  useLayoutEffect(() => {
    function sync() {
      // Always align child links to the first top-level header nav item.
      const anchor = document.querySelector<HTMLElement>('[data-nav-anchor]')
      const linksSlot = linksSlotRef.current
      if (!anchor || !linksSlot) return

      // Border-box left of the links slot stays fixed; padding only shifts content inside.
      const slotLeft = linksSlot.getBoundingClientRect().left
      const anchorLeft = anchor.getBoundingClientRect().left
      const next = Math.max(0, Math.round(anchorLeft - slotLeft))
      setLinksPad((prev) => (prev === next ? prev : next))
    }

    sync()
    // Second pass after fonts/layout settle (centered nav can shift slightly).
    const raf = window.requestAnimationFrame(sync)
    window.addEventListener('resize', sync)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', sync)
    }
  }, [item.href])

  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-x-0 bottom-0 top-20 z-40 bg-[#111827]/20 backdrop-blur-[3px] max-xl:hidden min-[1440px]:top-20!"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="fixed inset-x-0 top-20 z-50 border-b border-[#E4E7EE] bg-[#F8F9FC]/95 shadow-[0_28px_60px_-24px_rgba(17,24,39,0.28)] backdrop-blur-xl max-xl:hidden min-[1440px]:top-20!"
      >
        {/* Explore stays under the logo column; child links align to the first header nav item. */}
        <div className="mx-auto flex w-full px-4 sm:px-6 md:px-8 xl:px-14 min-[1440px]:max-w-[1440px]">
          <div className="flex w-full items-start py-10">
            <div className="w-[205px] shrink-0 border-r border-[#E4E7EE] pr-8">
              <p className="font-sans text-xs leading-4 font-medium tracking-[0.16em] text-[#292F35] uppercase">
                {exploreLabel}
              </p>
              <p className="mt-4 font-sans text-[28px] leading-9 font-medium tracking-normal text-[#1CACAE] antialiased">
                {item.label}
              </p>
            </div>
            <div
              ref={linksSlotRef}
              className="flex min-w-0 flex-1"
              style={{ paddingLeft: linksPad }}
            >
              <div
                className={cn(
                  'grid w-full max-w-full gap-x-16 gap-y-10',
                  item.groups.length > 1 ? 'grid-cols-2' : 'grid-cols-1',
                )}
              >
                {item.groups.map((group) => (
                  <div key={group.title ?? item.href}>
                    {group.title ? (
                      <p className="mb-4 font-sans text-xs leading-4 font-medium tracking-[0.16em] text-[#1CACAE] uppercase">
                        {group.title}
                      </p>
                    ) : null}
                    <ul className="flex flex-col gap-3">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <NavAnchor
                            link={link}
                            className="relative inline-block cursor-pointer font-sans text-[16px] leading-6 font-normal text-[#292F35] antialiased after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.4,0,0.2,1)] after:content-[''] hover:after:scale-x-100"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden w-[140px] shrink-0 xl:block" aria-hidden="true" />
          </div>
        </div>
      </div>
    </>
  )
}
