import Image from 'next/image'
import Link from 'next/link'

const homeLinkClassName =
  'inline-flex h-8 shrink-0 items-center justify-center border border-solid border-[#C8CAD0] bg-transparent px-3 font-sans text-[13px] leading-[18px] font-normal tracking-normal text-[#464646] antialiased hover:bg-[#484D56]/5 sm:h-9 sm:px-3.5 sm:text-[14px] sm:leading-5 lg:h-10 lg:px-4 lg:text-[15px] lg:leading-[22px] 2xl:h-11 2xl:text-[16px] 2xl:leading-6'

export function ErrorScreen({
  label,
  title,
  description,
}: {
  label: string
  title: string
  description: string
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-[#F3F4F9] px-6 text-center">
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <Image
          src="/brand/brand-logo.svg"
          alt=""
          width={115}
          height={117}
          priority
          className="h-11 w-auto"
        />
        <p className="font-sans text-[13px] leading-[18px] font-normal tracking-normal text-[#898989]">
          {label}
        </p>
        <h1 className="font-sans text-3xl font-medium tracking-normal text-[#464646]">{title}</h1>
        <p className="font-sans text-[15px] leading-[22px] font-normal tracking-normal text-[#464646]">
          {description}
        </p>
        <Link href="/" className={homeLinkClassName}>
          Go home
        </Link>
      </div>
    </main>
  )
}
