import Image from 'next/image'
import Link from 'next/link'

import type { NavItem } from '@/config/navigation'

import { HeaderShell } from '@/components/site/header/header-shell'
import { SiteNavigation } from '@/components/site/navigation/site-navigation'
import { SiteOutlineButton } from '@/components/site/site-outline-button'

export type SiteHeaderProps = {
  cta: {
    label: string
    href: string
  }
  navigation: readonly NavItem[]
  exploreLabel: string
}

export function SiteHeader({ cta, navigation, exploreLabel }: SiteHeaderProps) {
  return (
    <HeaderShell>
      <div className="mx-auto flex h-full w-full items-center px-4 sm:px-6 md:px-8 xl:px-14 min-[1440px]:max-w-[1440px]">
        <Link
          href="/"
          aria-label="Unlocked Ventures"
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 sm:gap-2.5 md:gap-[11px] lg:gap-3 2xl:gap-[13px] min-[1440px]:gap-3!"
        >
          <Image
            src="/brand/brand-logo.svg"
            alt=""
            width={115}
            height={117}
            priority
            className="h-7 w-auto sm:h-8 md:h-9 lg:h-10 xl:h-10 2xl:h-11 min-[1440px]:h-10!"
          />
          <Image
            src="/brand/unlocked-ventures-wordmark.svg"
            alt=""
            width={154}
            height={15}
            priority
            className="h-[10.5px] w-auto sm:h-3 md:h-[13.5px] lg:h-[15px] xl:h-[15px] 2xl:h-[16.5px] min-[1440px]:h-[15px]!"
          />
        </Link>
        <SiteNavigation items={navigation} cta={cta} exploreLabel={exploreLabel} />
        <div className="hidden xl:block">
          <SiteOutlineButton href={cta.href} text={cta.label} variant="solid" hoverArrow />
        </div>
      </div>
    </HeaderShell>
  )
}
