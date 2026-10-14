import Link from 'next/link'

import { ButtonHoverArrow, buttonHoverLabelClassName } from '@/components/site/site-outline-button'

const labelClassName = 'block leading-none'

export type TryingToBuildSectionProps = {
  title: string
  description: string
  cta: {
    label: string
    href: string
  }
}

export function TryingToBuildSection({ title, description, cta }: TryingToBuildSectionProps) {
  return (
    <section className="bg-white">
      <div className="relative w-full overflow-hidden bg-[#484D56]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(90deg,rgba(12,21,28,0.4)_0%,#4E5C6C_50%,rgba(12,21,28,0.4)_100%)]"
        />
        <div className="relative z-10 flex w-full flex-col items-center gap-8 px-6 py-16 text-center sm:px-8 md:py-20 xl:gap-10 xl:px-12">
          <div className="flex w-full max-w-[680px] flex-col items-center gap-4">
            <h2 className="font-sans text-[1.75rem] leading-9 font-bold text-white sm:text-[2rem] sm:leading-10 md:text-[36px] md:leading-[44px]">
              {title}
            </h2>
            <p className="font-sans text-base leading-6 font-normal text-white">{description}</p>
          </div>
          <Link
            href={cta.href}
            className="group/cta relative inline-flex h-14 items-center justify-center bg-white px-6 font-sans text-base font-semibold text-[#222222]"
          >
            <span className="inline-flex items-center">
              <span className={`${labelClassName} ${buttonHoverLabelClassName}`}>{cta.label}</span>
              <ButtonHoverArrow />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
