const principles = [
  {
    title: 'Outcomes over output',
    body: 'We agree what success looks like before we write a line of code, then report against it.',
    icon: '/about/icons/outcomes.svg',
    width: 90,
    height: 90,
  },
  {
    title: 'One team',
    body: 'Advisors and engineers work side by side, so strategy never gets lost in handover.',
    icon: '/about/icons/one-team.svg',
    width: 99,
    height: 90,
  },
  {
    title: 'Build to last',
    body: 'Documented, tested and maintainable systems that your team can own after we leave.',
    icon: '/about/icons/build-to-last.svg',
    width: 80,
    height: 80,
  },
] as const

export function AboutHowWeWork() {
  return (
    <section className="bg-white py-[100px]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[156px]">
        <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-[3rem] md:leading-[56px]">
          How we work
        </h2>
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {principles.map((item) => (
            <li key={item.title} className="flex flex-col gap-8 bg-[#F3F4F9] px-8 py-14 lg:py-[72px]">
              <img
                src={item.icon}
                alt=""
                width={item.width}
                height={item.height}
                className="h-auto w-auto max-w-[99px]"
              />
              <div className="flex flex-col gap-5">
                <h3 className="font-sans text-[22px] leading-7 font-normal text-[#25282D]">{item.title}</h3>
                <p className="font-sans text-base leading-6 font-normal text-[#222222]">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
