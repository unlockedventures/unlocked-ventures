import Image from 'next/image'
import Link from 'next/link'

const relatedSolutions = [
  {
    title: 'Product Strategy',
    href: '/solutions/product-strategy',
    body: '1,000 people doing analytics, machine learning, and AI for PE so you can confidently set your strategy.',
    icon: '/solutions/strategic-growth/icon-product-strategy.svg',
    iconWidth: 80,
    iconHeight: 79,
  },
  {
    title: 'Market Positioning',
    href: '/solutions/market-positioning',
    body: 'We work directly with the finance team, leveraging their data ownership, to size the value creation prize.',
    icon: '/solutions/strategic-growth/icon-market-positioning.svg',
    iconWidth: 73,
    iconHeight: 79,
  },
  {
    title: 'Engineering as a Service',
    href: '/solutions/engineering-as-a-service',
    body: '1,000 people doing analytics, machine learning, and AI for PE so you can confidently set your strategy.',
    icon: '/solutions/strategic-growth/icon-engineering-as-a-service.svg',
    iconWidth: 80,
    iconHeight: 80,
  },
] as const

export function RelatedSolutionsSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pt-16 pb-16 sm:px-6 md:px-8 md:pt-20 md:pb-20 lg:px-[72px] xl:gap-12 xl:px-[156px] xl:pt-[100px] xl:pb-[120px]">
        <h2 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#171616] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
          Related solutions
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {relatedSolutions.map((solution) => (
            <li key={solution.href} className="min-w-0">
              <Link
                href={solution.href}
                className="flex h-full flex-col gap-8 bg-[#F3F4F9] px-8 py-12 xl:px-8 xl:py-[72px]"
              >
                <Image
                  src={solution.icon}
                  alt=""
                  width={solution.iconWidth}
                  height={solution.iconHeight}
                  className="h-20 w-auto shrink-0 self-start"
                  style={{ width: 'auto', height: 80 }}
                />
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
