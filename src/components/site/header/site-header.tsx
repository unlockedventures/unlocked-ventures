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
      <div className="mx-auto flex h-full w-full max-w-[1440px] items-center px-4 sm:px-6 md:px-8 lg:px-[72px] 2xl:px-24">
        <Link
          href="/"
          aria-label="Unlocked Ventures"
          className="inline-flex shrink-0 cursor-pointer items-center gap-2 sm:gap-2.5 md:gap-[11px] lg:gap-3 2xl:gap-[13px]"
        >
          <Image
            src="/brand/brand-logo.svg"
            alt=""
            width={115}
            height={117}
            priority
            className="h-7 w-auto sm:h-8 md:h-9 lg:h-10 xl:h-10 2xl:h-11"
          />
          <Image
            src="/brand/unlocked-ventures-wordmark.svg"
            alt=""
            width={154}
            height={15}
            priority
            className="h-[10.5px] w-auto sm:h-3 md:h-[13.5px] lg:h-[15px] xl:h-[15px] 2xl:h-[16.5px]"
          />
        </Link>
        <SiteNavigation items={navigation} cta={cta} exploreLabel={exploreLabel} />
        <div className="hidden xl:block">
          <SiteOutlineButton href={cta.href} text={cta.label} />
        </div>
      </div>
    </HeaderShell>
  )
}
