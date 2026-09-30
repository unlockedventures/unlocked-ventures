const stats = [
  { value: '3.2x', label: 'Average ROI for clients' },
  { value: '140+', label: 'Products shipped' },
  { value: '85', label: 'Engineers, designers and advisors' },
  { value: '3', label: 'Offices on two continents' },
] as const

export function AboutDelivered() {
  return (
    <section id="experience" className="scroll-mt-24 bg-[#F3F4F9] py-[100px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[156px]">
        <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-[3rem] md:leading-[56px]">
          What we&apos;ve delivered
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.label} className="flex flex-col gap-6 bg-white px-8 py-14">
              <p className="font-sans text-[3rem] leading-[56px] font-light tracking-[-1px] text-[#4F5663]">
                {stat.value}
              </p>
              <p className="font-sans text-lg leading-[26px] font-normal text-[#222222]">{stat.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
