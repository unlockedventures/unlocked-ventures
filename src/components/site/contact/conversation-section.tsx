import Image from 'next/image'
import Link from 'next/link'

import type { ContactFormContent } from '@/components/site/contact/contact-form'

export type ContactCard = {
  label: string
  value: string
  href: string
  iconSrc: string
  iconWidth: number
  iconHeight: number
}

export type ContactPageContent = {
  metaTitle: string
  metaDescription: string
  breadcrumbHomeLabel: string
  breadcrumbHomeHref: string
  breadcrumbCurrent: string
  title: string
  illustrationSrc?: string
  cards: ContactCard[]
  helpTitle: string
  form: ContactFormContent
}

export function ConversationSection({
  breadcrumbHomeLabel,
  breadcrumbHomeHref,
  breadcrumbCurrent,
  title,
  illustrationSrc,
  cards,
}: Pick<
  ContactPageContent,
  | 'breadcrumbHomeLabel'
  | 'breadcrumbHomeHref'
  | 'breadcrumbCurrent'
  | 'title'
  | 'illustrationSrc'
  | 'cards'
>) {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto w-full max-w-[1440px]">
        {illustrationSrc ? (
          <Image
            src={illustrationSrc}
            alt=""
            width={1475}
            height={993}
            priority
            unoptimized
            className="pointer-events-none absolute top-0 left-[calc(265/1440*100%)] z-0 h-auto w-[calc(1475/1440*100%)] max-w-none -translate-y-[calc(108/993*100%)] select-none min-[1440px]:top-[-50px] min-[1440px]:left-[266px] min-[1440px]:h-[756px] min-[1440px]:w-[1174px] min-[1440px]:translate-y-0 min-[1440px]:opacity-80"
          />
        ) : null}
        <div className="relative z-10 flex w-full flex-col gap-12 px-4 pt-12 pb-16 sm:px-6 md:px-8 md:pt-16 lg:pt-20 lg:pb-20 xl:px-14 min-[1440px]:pb-[120px]!">
          <div className="flex max-w-[1128px] flex-col gap-8 md:gap-12">
            <p className="font-sans text-base leading-[22px] font-normal text-[#222222] min-[1440px]:[text-box-edge:cap_alphabetic] min-[1440px]:[text-box-trim:trim-both]">
              <Link
                href={breadcrumbHomeHref}
                className="hover:text-[#1CACAE] min-[1440px]:text-[#919191] min-[1440px]:hover:text-[#1CACAE]"
              >
                {breadcrumbHomeLabel}
              </Link>
              <span aria-hidden="true"> / </span>
              <span>{breadcrumbCurrent}</span>
            </p>
            <h1 className="max-w-[18ch] font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
              {title}
            </h1>
          </div>
          <ul className="grid max-w-[1128px] grid-cols-1 gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <li key={card.label} className="flex flex-col gap-8 bg-[#F3F4F9] px-8 py-12">
                <span className="flex size-[90px] items-center justify-center">
                  <Image
                    src={card.iconSrc}
                    alt=""
                    width={card.iconWidth}
                    height={card.iconHeight}
                    unoptimized
                  />
                </span>
                <p className="flex flex-col gap-2 min-[1440px]:gap-4">
                  <span className="font-sans text-base leading-[22px] font-normal text-[#222222]/85 min-[1440px]:leading-6">
                    {card.label}
                  </span>
                  <a
                    href={card.href}
                    className="font-sans text-[22px] leading-7 font-normal break-words text-[#25282D] hover:text-[#1CACAE]"
                  >
                    {card.value}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
