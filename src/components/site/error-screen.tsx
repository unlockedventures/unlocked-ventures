import Image from 'next/image'

import { SiteOutlineButton } from '@/components/site/site-outline-button'

export function ErrorScreen({
  label,
  title,
  description,
  homeLabel = 'Go home',
}: {
  label: string
  title: string
  description: string
  homeLabel?: string
}) {
  return (
    <main className="flex min-h-svh flex-col items-center overflow-y-auto bg-[#F3F4F9] px-6 py-16 text-center">
      <div className="my-auto flex w-full max-w-xl flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-5">
          <Image
            src="/brand/brand-logo.svg"
            alt=""
            width={115}
            height={117}
            priority
            className="h-16 w-auto"
          />
          <p className="font-sans text-[2.5rem] leading-none font-normal tracking-tight text-[#6A6D75] sm:text-[3rem]">
            {label}
          </p>
        </div>
        <div className="flex w-full flex-col items-center gap-3">
          <h1 className="font-sans text-2xl font-medium tracking-normal text-[#464646] sm:text-3xl">
            {title}
          </h1>
          <p className="max-w-md font-sans text-base leading-6 font-normal tracking-normal text-[#292F35] sm:text-lg sm:leading-7">
            {description}
          </p>
        </div>
        <SiteOutlineButton href="/" text={homeLabel} />
      </div>
    </main>
  )
}
