'use client'

import { useEffect, type ReactNode } from 'react'
import { cn } from 'cn'

import { useHeaderStore } from '@/stores/header-store'

const headerShadowClassName = 'shadow-[0_10px_24px_-12px_rgba(17,24,39,0.35)]'

const headerClassName =
  'sticky top-0 z-50 box-border h-14 border-b border-[#898989]/16 bg-[#F3F4F9] shadow-none transition-shadow duration-300 ease-out sm:h-16 md:h-[72px] lg:h-20 2xl:h-[88px] min-[1440px]:h-20!'

export function useHeaderMenuScroll() {
  return useHeaderStore((state) => state.setMenuScrolled)
}

export function HeaderShell({ children }: { children: ReactNode }) {
  const pageScrolled = useHeaderStore((state) => state.pageScrolled)
  const menuScrolled = useHeaderStore((state) => state.menuScrolled)
  const setPageScrolled = useHeaderStore((state) => state.setPageScrolled)

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 0
      setPageScrolled(next)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [setPageScrolled])

  return (
    <header className={cn(headerClassName, pageScrolled && headerShadowClassName)}>
      {children}
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-0 z-[60] shadow-none transition-shadow duration-300 ease-out',
          menuScrolled && headerShadowClassName,
        )}
      />
    </header>
  )
}
