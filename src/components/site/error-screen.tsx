import Image from 'next/image'

import { SiteOutlineLink } from '@/components/site/site-outline-link'

export function ErrorScreen({
  label,
  title,
  description,
}: {
  label: string
  title: string
  description: string
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#F3F4F9] px-6 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <Image
          src="/brand/brand-logo.svg"
          alt=""
          width={115}
          height={117}
          priority
          className="h-11 w-auto"
        />
        <p className="font-sans text-[13px] leading-[18px] font-normal tracking-normal text-[#898989]">
          {label}
        </p>
        <h1 className="font-sans text-3xl font-medium tracking-normal text-[#464646]">{title}</h1>
        <p className="font-sans text-[15px] leading-[22px] font-normal tracking-normal text-[#464646]">
          {description}
        </p>
        <SiteOutlineLink href="/">Go home</SiteOutlineLink>
      </div>
    </main>
  )
}
