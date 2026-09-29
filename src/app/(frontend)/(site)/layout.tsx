import { SiteFooter } from '@/components/site/footer/site-footer'
import { SiteHeader } from '@/components/site/header/site-header'

export default function SiteLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  )
}
