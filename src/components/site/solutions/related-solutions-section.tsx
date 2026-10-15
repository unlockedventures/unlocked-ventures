import Image from 'next/image'
import Link from 'next/link'

export type RelatedSolutionsSectionProps = {
  title: string
  solutions: readonly {
    title: string
    href: string
    body: string
    iconSrc?: string
    iconWidth?: number
    iconHeight?: number
  }[]
}

export function RelatedSolutionsSection({ title, solutions }: RelatedSolutionsSectionProps) {
  return (
    <section className="bg-white">
      <div className="flex w-full flex-col gap-8 pt-16 pb-16 md:pt-20 md:pb-20 xl:gap-12 xl:pt-[100px] xl:pb-[120px]">
        <h2 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#171616] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
          {title}
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {solutions.map((solution) => (
            <li key={solution.href} className="min-w-0">
              <Link
                href={solution.href}
                className="flex h-full flex-col gap-8 bg-[#F3F4F9] px-8 py-12 xl:px-8 xl:py-[72px]"
              >
                {solution.iconSrc ? (
                  <Image
                    src={solution.iconSrc}
                    alt=""
                    width={solution.iconWidth || 80}
                    height={solution.iconHeight || 80}
                    className="h-20 w-auto shrink-0 self-start"
                    style={{ width: 'auto', height: 80 }}
                  />
                ) : null}
                <div className="flex flex-col gap-5">
                  <h3 className="font-sans text-[22px] leading-7 font-normal text-[#25282D]">
                    {solution.title}
                  </h3>
                  <p className="font-sans text-base leading-6 font-normal text-[#222222]">{solution.body}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
