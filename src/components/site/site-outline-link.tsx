import Link from 'next/link'
import type { ReactNode } from 'react'

const outlineLinkClassName =
  'inline-flex h-8 shrink-0 items-center justify-center border border-solid border-[#C8CAD0] bg-transparent px-3 font-sans text-[13px] leading-[18px] font-normal tracking-normal text-[#464646] antialiased hover:bg-[#484D56]/5 sm:h-9 sm:px-3.5 sm:text-[14px] sm:leading-5 lg:h-10 lg:px-4 lg:text-[15px] lg:leading-[22px] 2xl:h-11 2xl:text-[16px] 2xl:leading-6'

export function SiteOutlineLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={outlineLinkClassName}>
      {children}
    </Link>
  )
}
