const logos = [
  { name: 'Constellation', src: '/about/logos/constellation.svg', width: 164, height: 40 },
  { name: 'Bill', src: '/about/logos/bill.svg', width: 40, height: 30 },
  { name: 'Elevance Health', src: '/about/logos/elevance.svg', width: 115, height: 48 },
  { name: 'TransUnion', src: '/about/logos/transunion.svg', width: 145, height: 39 },
  { name: 'Exelon', src: '/about/logos/exelon.png', width: 150, height: 38 },
  { name: 'Corcentric', src: '/about/logos/corcentric.svg', width: 118, height: 67 },
  { name: 'PayPal', src: '/about/logos/paypal.svg', width: 124, height: 33 },
  { name: 'Amwell', src: '/about/logos/amwell.svg', width: 130, height: 36 },
  { name: 'Vori Health', src: '/about/logos/vori-health.svg', width: 180, height: 34 },
  { name: 'Coca-Cola', src: '/about/logos/coca-cola.svg', width: 120, height: 41 },
  { name: 'Bboxx', src: '/about/logos/bboxx.png', width: 120, height: 34 },
  { name: 'Invitation', src: '/about/logos/invitation.svg', width: 184, height: 35 },
  { name: 'Hologic', src: '/about/logos/hologic.png', width: 116, height: 41 },
  { name: 'Vodafone', src: '/about/logos/vodafone.svg', width: 150, height: 36 },
  { name: 'WeightWatchers', src: '/about/logos/weight-watchers.svg', width: 129, height: 84 },
] as const

export function AboutLogoWall({ spaced = false }: { spaced?: boolean }) {
  return (
    <section
      aria-label="Trusted by leading global enterprises"
      className={spaced ? 'bg-white py-[100px]' : 'bg-white pt-[100px] pb-[100px]'}
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center gap-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-[156px]">
        <h2 className="text-center font-sans text-[1.75rem] leading-[2.25rem] font-normal tracking-[-1px] text-[#33353F] md:text-[2.25rem] md:leading-[56px]">
          Trusted by leading global enterprises
        </h2>
        <ul className="grid w-full max-w-[1128px] grid-cols-2 items-center gap-x-[27px] gap-y-[27px] sm:grid-cols-3 lg:grid-cols-5">
          {logos.map((logo) => (
            <li key={logo.name} className="flex h-[84px] items-center justify-center">
              <img
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className="h-auto max-h-[84px] w-auto max-w-full"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
