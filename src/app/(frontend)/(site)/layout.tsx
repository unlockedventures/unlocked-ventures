import { SiteFooter } from '@/components/site/footer/site-footer'
import { SiteHeader } from '@/components/site/header/site-header'
import { getFooter } from '@/data/get-footer'
import { getHeader } from '@/data/get-header'
import { getNavigation } from '@/data/get-navigation'

export default async function SiteLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const [header, navigation, footer] = await Promise.all([getHeader(), getNavigation(), getFooter()])

  return (
    <>
      {header && navigation ? (
        <SiteHeader
          cta={header.cta}
          navigation={navigation.items}
          exploreLabel={navigation.exploreLabel}
        />
      ) : null}
      <main>{children}</main>
      {footer ? <SiteFooter {...footer} /> : null}
    </>
  )
}
