import Image from 'next/image'
import Link from 'next/link'

import { primaryNavigation } from '@/config/navigation'

const contactItems = [
  {
    label: 'info@unlockedventures.com',
    href: 'mailto:info@unlockedventures.com',
    icon: '/footer/footer-icons/Envelope.svg',
  },
  {
    label: '+408-905-8046',
    href: 'tel:+14089058046',
    icon: '/footer/footer-icons/PhoneCall.svg',
  },
] as const

const socialIcons = [
  { label: 'Facebook', src: '/footer/footer-icons/facebook.svg', width: 22, height: 22 },
  { label: 'Twitter', src: '/footer/footer-icons/twitter.svg', width: 22, height: 19 },
  { label: 'Pinterest', src: '/footer/footer-icons/pinterest.svg', width: 22, height: 22 },
  { label: 'Instagram', src: '/footer/footer-icons/instagram.svg', width: 22, height: 22 },
  { label: 'Dribbble', src: '/footer/footer-icons/dribbble.svg', width: 22, height: 22 },
] as const

const columnTitleClassName =
  'font-dm-sans text-xl leading-7 font-bold text-white'

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#30373F] xl:min-h-[488px]">
      <img
        src="/footer/Footer%20wave.svg"
        alt=""
        className="pointer-events-none absolute top-[clamp(1.5rem,6.18vw,89px)] left-0 h-[min(calc(100%-clamp(1.5rem,6.18vw,89px)),calc(100vw*361/1440))] w-full object-cover object-top select-none"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col px-4 pt-12 pb-8 sm:px-6 md:px-8 md:pt-16 lg:px-12 lg:pt-16 xl:min-h-[488px] xl:px-[156px] xl:pt-20 xl:pb-8">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between">
        <div className="w-full max-w-[344px] shrink-0">
          <Link
            href="/"
            aria-label="Unlocked Ventures"
            className="inline-flex cursor-pointer items-center gap-2.5 sm:gap-3"
          >
            <Image
              src="/brand/brand-logo-on-dark.svg"
              alt=""
              width={115}
              height={117}
              className="h-8 w-auto sm:h-9 lg:h-10"
            />
            <Image
              src="/brand/unlocked-ventures-wordmark-on-dark.svg"
              alt=""
              width={154}
              height={15}
              className="h-3 w-auto sm:h-[13.5px] lg:h-[15px]"
            />
          </Link>
          <p className="mt-8 font-sans text-base leading-6 font-normal text-white/70">
            Unlocked Ventures is an award-winning AI-native digital development company, helping
            businesses with product design, development, and technology acceleration.
          </p>
          <ul className="mt-8 flex flex-col gap-4 sm:gap-6">
            {contactItems.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="inline-flex cursor-pointer items-center gap-3">
                  <Image src={item.icon} alt="" width={24} height={24} className="size-6 shrink-0" />
                  <span className="font-sans text-sm leading-6 font-normal break-all text-white/70 sm:text-base">
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex w-full flex-col gap-10 sm:flex-row sm:items-start sm:justify-between xl:contents">
        <nav aria-label="Footer" className="shrink-0">
          <h2 className={columnTitleClassName}>Pages</h2>
          <ul className="mt-8 flex flex-col">
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="cursor-pointer font-sans text-base leading-8 font-normal text-white/70 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <form className="w-full shrink-0 sm:max-w-[320px] xl:w-[320px]">
          <h2 className={columnTitleClassName}>Newsletter</h2>
          <p className="mt-8 font-sans text-base leading-6 font-normal text-white/70">
            Get the latest insights and updates, straight to your inbox.
          </p>
          <div className="mt-6 flex h-14 items-center bg-white/8 pr-2 pl-3 sm:h-[60px] sm:pr-[9px] sm:pl-[17px]">
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              name="email"
              required
              placeholder="Enter email address"
              className="min-w-0 flex-1 bg-transparent font-sans text-sm leading-6 font-normal text-white outline-none placeholder:text-white/70"
            />
            <button
              type="button"
              className="inline-flex h-10 w-[5.5rem] shrink-0 cursor-pointer items-center justify-center bg-white font-sans text-sm leading-6 font-medium text-[#30373F] sm:h-[42px] sm:w-[90px]"
            >
              Subscribe
            </button>
          </div>
        </form>
        </div>
        </div>
        <div className="mt-10 border-t border-white/12 pt-6 sm:pt-8 xl:mt-auto">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
            <p className="font-sans text-sm leading-6 font-normal text-white/70 sm:text-base">
              © 2026 Unlocked Ventures. All rights reserved.
            </p>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {socialIcons.map((icon) => (
                <li key={icon.label}>
                  <Image
                    src={icon.src}
                    alt={icon.label}
                    width={icon.width}
                    height={icon.height}
                    className="h-5 w-auto"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
