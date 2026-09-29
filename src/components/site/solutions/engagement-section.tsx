const engagementItems = [
  {
    number: '01',
    title: 'Technology diligence',
    body: 'A clear read on the stack, the team, and the spend before the deal closes, written for an investment committee rather than a CTO.',
  },
  {
    number: '02',
    title: 'AI and data strategy',
    body: 'Where AI earns its cost in this business, which initiatives to fund first, and what each one is worth against the plan.',
  },
  {
    number: '03',
    title: 'Value creation planning',
    body: 'Initiatives priced, sequenced, and tied to owners and milestones the board can track quarter by quarter.',
  },
  {
    number: '04',
    title: 'Executive support',
    body: 'Standing access to senior advisors for the CEO and CTO through the messy middle of execution, not just the kickoff.',
  },
] as const

export function EngagementSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 pt-16 pb-16 sm:px-6 md:px-8 md:pt-20 md:pb-20 lg:px-[72px] xl:px-[156px] xl:pt-[100px] xl:pb-[100px]">
        <h2 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
          What the engagement covers
        </h2>
        <ul className="w-full max-w-[1076px]">
          {engagementItems.map((item) => (
            <li
              key={item.number}
              className="grid grid-cols-1 gap-3 border-t border-[#E6E9ED] py-6 md:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] md:items-center md:gap-16 md:py-7"
            >
              <div>
                <p className="font-sans text-sm leading-5 font-normal text-[#8D959D]">{item.number}</p>
                <p className="mt-2 font-sans text-xl leading-7 font-normal text-[#1B2027]">{item.title}</p>
              </div>
              <p className="max-w-[36rem] font-sans text-base leading-6 font-normal text-[#5A646F]">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
