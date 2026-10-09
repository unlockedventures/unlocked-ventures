import Link from 'next/link'

import type { InsightsListingCopy } from '@/components/site/insights/insights-listing'
import { InsightMetaBar } from '@/components/site/insights/insight-meta-bar'
import { InsightRelated } from '@/components/site/insights/insight-related'
import { InsightShare } from '@/components/site/insights/insight-share'
import { InsightToc } from '@/components/site/insights/insight-toc'
import type { NewsPostDetail } from '@/data/get-news-post'

export function InsightArticle({
  post,
  copy,
}: {
  post: NewsPostDetail
  copy: InsightsListingCopy
}) {
  const headings = post.body.filter((block) => block.type === 'heading')
  const shareUrl = `https://unlockedventures.com${post.href}`
  const metaParts = [post.publishedAt, post.readTime].filter(Boolean)
  const crumbTitle =
    post.title.length > 42 ? `${post.title.slice(0, 42).trimEnd()}…` : post.title

  return (
    <article className="relative isolate flex w-full flex-col items-center bg-white p-0">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center px-4 pt-12 pb-16 sm:px-6 md:px-8 md:pt-16 md:pb-20 xl:px-14 xl:pt-20 xl:pb-24">
        <div className="flex w-full max-w-[820px] flex-col gap-6 self-start md:gap-8">
          <p className="font-sans text-base leading-[22px] font-normal text-[#222222]">
            <Link href={copy.homeHref} className="hover:text-[#1CACAE] min-[1440px]:text-[#919191]">
              {copy.homeLabel}
            </Link>
            <span aria-hidden="true" className="min-[1440px]:text-[#919191]">
              {' '}
              /{' '}
            </span>
            <Link href="/insights" className="hover:text-[#1CACAE] min-[1440px]:text-[#919191]">
              {copy.currentLabel}
            </Link>
            <span aria-hidden="true" className="min-[1440px]:text-[#919191]">
              {' '}
              /{' '}
            </span>
            <span>{crumbTitle}</span>
          </p>

          <h1 className="font-sans text-[2rem] leading-[2.4rem] font-normal tracking-[-1px] text-[#33353F] sm:text-4xl sm:leading-[2.75rem] lg:text-5xl lg:leading-[56px]">
            {post.title}
          </h1>
          <p className="font-sans text-base leading-6 font-normal tracking-[0.36px] text-[#23313C] md:text-lg md:leading-[27px] min-[1440px]:opacity-80">
            {post.excerpt}
          </p>

          {post.authorName || metaParts.length > 0 ? (
            <div className="flex items-center gap-3">
              {post.authorImageSrc ? (
                <img
                  src={post.authorImageSrc}
                  alt=""
                  className="size-10 shrink-0 rounded-full object-cover"
                />
              ) : post.authorName ? (
                <span
                  aria-hidden="true"
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#E7E9F3] font-sans text-sm font-medium text-[#484D56]"
                >
                  {post.authorName
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-sm leading-5 font-normal text-[#484D56]">
                {post.authorName ? <span className="text-[#171616]">{post.authorName}</span> : null}
                {post.authorName && metaParts.length > 0 ? (
                  <span aria-hidden="true" className="text-[#C8CAD0]">
                    ·
                  </span>
                ) : null}
                {metaParts.length > 0 ? <span>{metaParts.join(' · ')}</span> : null}
              </div>
            </div>
          ) : null}
        </div>

        {post.imageSrc ? (
          <div className="mt-10 flex w-full items-center justify-center bg-[#F3F4F9] px-6 py-16 md:mt-12 md:px-10 md:py-20 xl:py-24">
            <img
              src={post.imageSrc}
              alt={post.imageAlt}
              className="h-auto w-full max-w-[280px] object-contain sm:max-w-[360px] md:max-w-[420px]"
            />
          </div>
        ) : null}

        <div className="mt-12 grid w-full gap-12 lg:mt-16 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-16 xl:grid-cols-[300px_minmax(0,720px)] xl:justify-between">
          <aside className="flex w-full max-w-[300px] flex-col items-start justify-center gap-12 p-0 lg:sticky lg:top-28 lg:self-start">
            <InsightToc
              title={copy.tocTitle}
              headings={headings.flatMap((heading) =>
                heading.type === 'heading' ? [{ id: heading.id, title: heading.title }] : [],
              )}
            />

            <InsightShare title={post.title} shareTitle={copy.shareTitle} url={shareUrl} />
          </aside>

          <div className="flex min-w-0 flex-col gap-8 md:gap-10">
            {post.body.map((block, index) => {
              if (block.type === 'paragraph') {
                return (
                  <p
                    key={`p-${index}`}
                    className="font-sans text-base leading-7 font-normal text-[#33353F] md:text-lg md:leading-8"
                  >
                    {block.text}
                  </p>
                )
              }
              if (block.type === 'heading') {
                return (
                  <h2
                    key={block.id}
                    id={block.id}
                    className="scroll-mt-28 font-sans text-[1.75rem] leading-9 font-normal tracking-[-0.5px] text-[#171616] md:text-[2rem] md:leading-10"
                  >
                    {block.title}
                  </h2>
                )
              }
              if (block.type === 'quote') {
                return (
                  <figure
                    key={`q-${index}`}
                    className="relative overflow-hidden bg-[#E8F4F8] px-6 py-8 md:px-10 md:py-10"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-4 left-4 font-serif text-6xl leading-none text-[#1CACAE]/35 md:top-5 md:left-6 md:text-7xl"
                    >
                      “
                    </span>
                    <blockquote className="relative font-sans text-xl leading-8 font-normal text-[#171616] md:text-2xl md:leading-9">
                      {block.text}
                    </blockquote>
                    {block.attribution ? (
                      <figcaption className="relative mt-4 font-sans text-sm leading-6 font-normal text-[#696969]">
                        — {block.attribution}
                      </figcaption>
                    ) : null}
                  </figure>
                )
              }
              if (block.type === 'image') {
                return (
                  <figure key={`img-${index}`} className="w-full overflow-hidden bg-[#F3F4F9]">
                    <img src={block.src} alt={block.alt} className="h-auto w-full object-cover" />
                  </figure>
                )
              }
              return (
                <ul key={`l-${index}`} className="flex list-disc flex-col gap-3 pl-5">
                  {block.items.map((item) => (
                    <li
                      key={item}
                      className="font-sans text-base leading-7 font-normal text-[#33353F] md:text-lg md:leading-8"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )
            })}

            <InsightMetaBar
              tags={post.tags}
              title={post.title}
              shareLabel={copy.shareTitle}
              url={shareUrl}
            />
          </div>
        </div>
      </div>

      <InsightRelated title={copy.relatedTitle} posts={post.related} />
    </article>
  )
}
