export type HowWeWorkSectionProps = {
  title: string
  steps: readonly {
    number: string
    title: string
    body: string
  }[]
}

export function HowWeWorkSection({ title, steps }: HowWeWorkSectionProps) {
  return (
    <section className="bg-[#F3F4F9]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-16 sm:px-6 md:px-8 md:py-20 xl:gap-12 xl:px-14 xl:py-[100px]">
        <h2 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
          {title}
        </h2>
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step) => (
            <li
              key={step.number}
              className="flex flex-col gap-8 bg-white px-8 py-12 xl:px-8 xl:py-[72px]"
            >
              <p className="font-sans text-6xl leading-none font-extralight tracking-[-1px] text-[#4F5663] lg:text-[72px] lg:leading-[56px]">
                {step.number}
              </p>
              <div className="flex flex-col gap-5">
                <h3 className="font-sans text-[22px] leading-7 font-normal text-[#25282D]">
                  {step.title}
                </h3>
                <p className="font-sans text-base leading-6 font-normal text-[#222222]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
