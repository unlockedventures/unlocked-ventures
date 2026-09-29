import Image from 'next/image'
import Link from 'next/link'

const contactCards = [
  {
    label: 'Phone number:',
    value: '+408-905-8046',
    href: 'tel:+14089058046',
    icon: '/contact/icon-phone.svg',
    iconWidth: 67,
    iconHeight: 67,
  },
  {
    label: 'Email address:',
    value: 'info@unlockedventures.com',
    href: 'mailto:info@unlockedventures.com',
    icon: '/contact/icon-email.svg',
    iconWidth: 69,
    iconHeight: 48,
  },
  {
    label: 'Website:',
    value: 'www.unlockedventures.com',
    href: 'https://www.unlockedventures.com',
    icon: '/contact/icon-website.svg',
    iconWidth: 66,
    iconHeight: 66,
  },
] as const

export function ConversationSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative mx-auto w-full max-w-[1440px]">
        <Image
          src="/contact/hero-illustration.svg"
          alt=""
          width={1475}
          height={993}
          priority
          className="pointer-events-none absolute top-0 left-[calc(265/1440*100%)] z-0 h-auto w-[calc(1475/1440*100%)] max-w-none -translate-y-[calc(108/993*100%)] select-none"
        />
        <div className="relative z-10 flex w-full flex-col gap-12 px-4 pt-12 pb-16 sm:px-6 md:px-8 md:pt-16 lg:px-[72px] lg:pt-20 lg:pb-20 xl:px-[156px]">
        <div className="flex max-w-[1128px] flex-col gap-8 md:gap-12">
          <p className="font-sans text-base leading-[22px] font-normal text-[#222222]">
            <Link href="/" className="hover:text-[#1CACAE]">
              Home
            </Link>
            <span aria-hidden="true"> / </span>
            <span>Contact</span>
          </p>
          <h1 className="max-w-[18ch] font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
            Let’s Start a Conversation
          </h1>
        </div>
        <ul className="grid max-w-[1128px] grid-cols-1 gap-4 md:grid-cols-3">
          {contactCards.map((card) => (
            <li key={card.label} className="flex flex-col gap-8 bg-[#F3F4F9] px-8 py-12">
              <span className="flex size-[90px] items-center justify-center">
                <Image src={card.icon} alt="" width={card.iconWidth} height={card.iconHeight} />
              </span>
              <p className="flex flex-col gap-2">
                <span className="font-sans text-base leading-[22px] font-normal text-[#222222]/85">
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
