import Image from 'next/image'
import Link from 'next/link'

export type ServiceIntroSectionProps = {
  breadcrumbs: readonly { label: string; href: string }[]
  current: string
  title: string
  description: string
  illustrationSrc?: string
  imageSrc?: string
  imageAlt?: string
}

export function ServiceIntroSection({
  breadcrumbs,
  current,
  title,
  description,
  illustrationSrc,
  imageSrc,
  imageAlt = '',
}: ServiceIntroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative w-full">
        {illustrationSrc ? (
          <Image
            src={illustrationSrc}
            alt=""
            width={1475}
            height={993}
            priority
            className="pointer-events-none absolute top-0 right-0 z-0 h-auto w-[min(100%,720px)] max-w-none translate-x-[12%] -translate-y-[18%] select-none"
          />
        ) : null}
        <div className="relative z-10 flex flex-col gap-6 xl:gap-10">
          <p className="font-sans text-base leading-[22px] font-normal text-[#222222]">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href}>
                {index > 0 ? <span aria-hidden="true"> / </span> : null}
                <Link href={crumb.href} className="hover:text-[#1CACAE]">
                  {crumb.label}
                </Link>
              </span>
            ))}
            <span aria-hidden="true"> / </span>
            <span>{current}</span>
          </p>
          <div className="flex flex-col gap-6">
            <h1 className="max-w-[40rem] font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
              {title}
            </h1>
            <p className="max-w-[40rem] font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px]">
              {description}
            </p>
          </div>
        </div>
        <div className="relative mt-8 aspect-[1440/560] w-full overflow-hidden bg-[#E8E8E8] md:mt-10 xl:mt-12">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="(max-width: 1440px) 70vw, 980px"
              className="object-cover object-[center_48%] grayscale"
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}
