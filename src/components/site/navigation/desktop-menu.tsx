import type { RefObject } from 'react'

import type { NavItem } from '@/config/navigation'
import { cn } from 'cn'

import { NavAnchor } from '@/components/site/navigation/nav-link'

export function DesktopMenu({
  item,
  panelRef,
  onEnter,
  onLeave,
  onClose,
}: {
  item: NavItem
  panelRef: RefObject<HTMLDivElement | null>
  onEnter: () => void
  onLeave: () => void
  onClose: () => void
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close menu"
        className="fixed inset-x-0 bottom-0 top-20 z-40 bg-[#111827]/20 backdrop-blur-[3px] max-xl:hidden 2xl:top-[88px]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="fixed inset-x-0 top-20 z-50 border-b border-[#E4E7EE] bg-[#F8F9FC]/95 shadow-[0_28px_60px_-24px_rgba(17,24,39,0.28)] backdrop-blur-xl before:absolute before:inset-x-0 before:-top-4 before:h-4 before:content-[''] max-xl:hidden 2xl:top-[88px]"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div className="mx-auto flex max-w-[1440px] gap-16 px-6 py-10 lg:px-[72px] 2xl:px-24">
          <div className="w-64 shrink-0 border-r border-[#E4E7EE] pr-10">
            <p className="font-sans text-xs leading-4 font-medium tracking-[0.16em] text-[#292F35] uppercase">
              Explore
            </p>
            <p className="mt-4 font-sans text-[28px] leading-9 font-medium tracking-normal text-[#1CACAE] antialiased">
              {item.label}
            </p>
          </div>
          <div className={cn('grid flex-1 gap-x-16 gap-y-10', item.groups.length > 1 ? 'grid-cols-2' : 'grid-cols-1')}>
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
                        className="cursor-pointer font-sans text-[16px] leading-6 font-normal text-[#292F35] antialiased transition-colors hover:text-[#1CACAE]"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
