import type { AboutContent } from '@/components/site/about/about-content'

export function AboutHowWeWork({
  title,
  principles,
}: {
  title: string
  principles: AboutContent['principles']
}) {
  return (
    <section className="bg-white py-16 md:py-20 xl:py-[100px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 sm:px-6 md:gap-12 md:px-8 lg:px-12 xl:px-[156px]">
        <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px]">
          {title}
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
          {principles.map((item) => (
            <li
              key={item.title}
              className="flex flex-col gap-6 bg-[#F3F4F9] px-6 py-10 sm:gap-8 sm:px-8 sm:py-12 xl:min-h-[420px] xl:py-[72px]"
            >
              <img
                src={item.iconSrc}
                alt=""
                width={item.width}
                height={item.height}
                className="h-auto w-auto max-w-[80px] sm:max-w-[99px]"
              />
              <div className="flex flex-col gap-4 sm:gap-5">
                <h3 className="font-sans text-xl leading-7 font-normal text-[#25282D] sm:text-[22px] sm:leading-7">
                  {item.title}
                </h3>
                <p className="font-sans text-base leading-6 font-normal text-[#222222]">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
