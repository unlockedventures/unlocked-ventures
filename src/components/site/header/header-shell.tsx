'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { cn } from 'cn'

const headerShadowClassName = 'shadow-[0_10px_24px_-12px_rgba(17,24,39,0.35)]'

const headerClassName =
  'sticky top-0 z-50 box-border h-14 border-b border-[#898989]/16 bg-[#F3F4F9] shadow-none transition-shadow duration-300 ease-out sm:h-16 md:h-[72px] lg:h-20 2xl:h-[88px] min-[1440px]:h-20!'

const MenuScrollContext = createContext<(scrolled: boolean) => void>(() => {})

export function useHeaderMenuScroll() {
  return useContext(MenuScrollContext)
}

export function HeaderShell({ children }: { children: ReactNode }) {
  const [pageScrolled, setPageScrolled] = useState(false)
  const [menuScrolled, setMenuScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 0
      setPageScrolled((current) => (current === next ? current : next))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn(headerClassName, pageScrolled && headerShadowClassName)}>
      <MenuScrollContext.Provider value={setMenuScrolled}>
        {children}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 z-[60] shadow-none transition-shadow duration-300 ease-out',
            menuScrolled && headerShadowClassName,
          )}
        />
      </MenuScrollContext.Provider>
    </header>
  )
}
