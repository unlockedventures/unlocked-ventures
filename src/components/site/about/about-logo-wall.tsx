import type { AboutContent } from '@/components/site/about/about-content'

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
      className={spaced ? 'bg-white py-[100px]' : 'bg-white pt-[100px] pb-[100px]'}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[156px]">
        <h2 className="text-center font-sans text-[1.75rem] leading-[2.25rem] font-normal tracking-[-1px] text-[#33353F] md:text-[2.25rem] md:leading-[56px]">
          {title}
        </h2>
        <ul className="grid w-full max-w-[1128px] grid-cols-2 items-center gap-x-[27px] gap-y-[27px] sm:grid-cols-3 lg:grid-cols-5">
          {logos.map((logo) => (
            <li key={logo.name} className="group flex h-[84px] items-center justify-center">
              <img
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className="h-auto max-h-[84px] w-auto max-w-full grayscale transition-[filter] duration-300 group-hover:grayscale-0"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
