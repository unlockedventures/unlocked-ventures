import Image from 'next/image'
import Link from 'next/link'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { RichText } from '@/components/site/rich-text'

export type SolutionArticleProps = {
  breadcrumbs: readonly { label: string; href: string }[]
  current: string
  title: string
  description: string
  imageSrc?: string
  imageAlt?: string
  body?: DefaultTypedEditorState | null
}

export function SolutionArticle({
  breadcrumbs,
  current,
  title,
  description,
  imageSrc,
  imageAlt = '',
  body,
}: SolutionArticleProps) {
  return (
    <article className="relative w-full bg-white">
      <div className="flex flex-col gap-6 xl:gap-10">
        <p className="font-sans text-base leading-[22px] font-normal text-[#222222]">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.href}-${crumb.label}`}>
              {index > 0 ? <span aria-hidden="true"> / </span> : null}
              <Link href={crumb.href} className="hover:text-[#1CACAE]">
                {crumb.label}
              </Link>
            </span>
          ))}
          <span aria-hidden="true"> / </span>
          <span>{current}</span>
        </p>

        <div className="flex flex-col gap-6">
          <h1 className="max-w-[40rem] font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
            {title}
          </h1>
          <p className="max-w-[40rem] font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px]">
            {description}
          </p>
        </div>
      </div>

      <div className="relative mt-8 aspect-[1440/560] w-full overflow-hidden bg-[#E8E8E8] md:mt-10 xl:mt-12">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 1440px) 70vw, 980px"
            className="object-cover object-[center_48%] grayscale"
          />
        ) : null}
      </div>

      {body ? <div className="mt-10 md:mt-12 xl:mt-14"><RichText data={body} /></div> : null}
    </article>
  )
}
