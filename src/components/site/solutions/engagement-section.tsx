export type EngagementSectionProps = {
  title: string
  items: readonly {
    number: string
    title: string
    body: string
  }[]
}

export function EngagementSection({ title, items }: EngagementSectionProps) {
  return (
    <section className="bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pt-16 pb-16 sm:px-6 md:px-8 md:pt-20 md:pb-20 xl:px-14 xl:pt-[100px] xl:pb-[100px]">
        <h2 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
          {title}
        </h2>
        <ul className="w-full">
          {items.map((item) => (
            <li
              key={item.number}
              className="grid grid-cols-1 gap-3 border-t border-[#E6E9ED] py-6 md:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] md:items-center md:gap-16 md:py-7"
            >
              <div>
                <p className="font-sans text-sm leading-5 font-normal text-[#8D959D]">{item.number}</p>
                <p className="mt-2 font-sans text-xl leading-7 font-normal text-[#1B2027]">{item.title}</p>
              </div>
              <p className="font-sans text-base leading-6 font-normal text-[#5A646F]">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
