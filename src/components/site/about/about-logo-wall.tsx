import type { AboutContent } from '@/components/site/about/about-content'
import { cn } from '@/lib/utils'

export function AboutLogoWall({
  title,
  logos,
  spaced = false,
}: {
  title: string
  logos: AboutContent['logos']
  spaced?: boolean
}) {
  return (
    <section
      aria-label={title}
      className={cn(
        'bg-white',
        spaced
          ? 'py-16 md:py-20 xl:py-[100px]'
          : 'pt-12 pb-16 md:pt-16 md:pb-20 xl:pt-[80px] xl:pb-[100px]',
      )}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 px-4 sm:px-6 md:gap-12 md:px-8 lg:px-12 xl:px-[156px]">
        <h2 className="max-w-[800px] text-center font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px]">
          {title}
        </h2>
        <ul className="grid w-full max-w-[1128px] grid-cols-2 items-center gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-x-[27px] sm:gap-y-[27px] lg:grid-cols-5">
          {logos.map((logo) => (
            <li key={logo.name} className="group flex h-16 items-center justify-center sm:h-[84px]">
              <img
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className="h-auto max-h-12 w-auto max-w-full grayscale transition-[filter] duration-300 group-hover:grayscale-0 sm:max-h-[84px]"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
