'use client'

import { SiteFooter } from '@/components/site/footer/site-footer'
import { SiteHeader } from '@/components/site/header/site-header'
import { useFooter, useHeader, useNavigation } from '@/hooks/queries/use-site-queries'

export function SiteShell({ children }: { children: React.ReactNode }) {
  const header = useHeader()
  const navigation = useNavigation()
  const footer = useFooter()

  const headerData = header.data
  const navigationData = navigation.data
  const footerData = footer.data

  return (
    <>
      {headerData && navigationData ? (
        <SiteHeader
          cta={headerData.cta}
          navigation={navigationData.items}
          exploreLabel={navigationData.exploreLabel}
        />
      ) : null}
      <main>{children}</main>
      {footerData ? <SiteFooter {...footerData} /> : null}
    </>
  )
}
