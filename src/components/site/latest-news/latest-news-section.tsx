import { SiteOutlineButton } from '@/components/site/site-outline-button'
import { ContentSlider } from '@/components/site/slider/content-slider'
import { cn } from '@/lib/utils'

export type NewsPost = {
  title: string
  excerpt: string
  href: string
  ctaLabel?: string
  imageSrc?: string
  imageAlt?: string
}

export type LatestNewsSectionProps = {
  title: string
  posts: readonly NewsPost[]
  className?: string
}

export const homepageNewsPosts = [
  {
    title: 'Harnessing AI for Charitable Impact',
    excerpt:
      'AI is reshaping how charities work and how people donate. The real opportunity lies less in new tools than in...',
    href: '/insights/harnessing-ai-for-charitable-impact',
    ctaLabel: 'Read More',
    imageSrc: '/news/harnessing-ai-for-charitable-impact.png',
  },
  {
    title: '3 things finance teams get wrong before AI can accelerate the close',
    excerpt:
      'Before AI can transform the financial close, teams need to address the process, data, and workflow gaps holding them back.',
    href: '/insights/finance-teams-before-ai-can-accelerate-the-close',
    ctaLabel: 'Read More',
    imageSrc: '/news/finance-teams-before-ai.png',
  },
  {
    title: 'Trailer manufacturer’s transformation lifts revenue by $15M',
    excerpt:
      'You’re ALCOM, a leading manufacturer of top-quality aluminum trailer products. You have expanded production facilities from a single flagship plant to 6 plants across the country. Your business has grown. Now your operational sophistication must follow in tow.',
    href: '/insights/trailer-manufacturer-transformation',
    ctaLabel: 'Read More',
    imageSrc: '/news/trailer-manufacturer-transformation.png',
  },
] as const satisfies readonly NewsPost[]

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 shrink-0">
      <path
        d="M7 17L17 7M7 7L17 7L17 17"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NewsCard({ post }: { post: NewsPost }) {
  return (
    <article className="flex h-full flex-col gap-8 border border-[#E7E9F3] bg-[#F3F4F9] pb-3">
      <div className="flex h-[270px] shrink-0 items-center justify-center">
        {post.imageSrc ? (
          <img
            src={post.imageSrc}
            alt={post.imageAlt ?? ''}
            className="size-[220px] object-contain"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-6 px-6 pb-5 sm:px-8">
        <div className="flex flex-col gap-3">
          <h3 className="min-h-[60px] font-sans text-2xl leading-[30px] font-normal tracking-[-0.48px] text-[#25282D]">
            {post.title}
          </h3>
          <p className="h-12 overflow-hidden font-sans text-base leading-6 font-normal text-ellipsis text-[#222222]/68 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
            {post.excerpt}
          </p>
        </div>
        <div className="mt-auto">
          <SiteOutlineButton
            href={post.href}
            text={post.ctaLabel ?? 'Read More'}
            icon={<ArrowUpRight />}
            className="h-12 w-[154px] gap-2.5 border-[#484D56]! px-5 text-base whitespace-nowrap text-[#484D56] hover:border-[#484D56] hover:bg-[#484D56] hover:text-white sm:h-12 sm:border-[#484D56]! sm:px-5 sm:text-base lg:h-12 lg:border-[#484D56]! lg:px-5 lg:text-base lg:hover:border-[#484D56] lg:hover:bg-[#484D56] lg:hover:text-white 2xl:h-12 2xl:border-[#484D56]! 2xl:px-5 2xl:text-base [&>span]:shrink-0"
          />
        </div>
      </div>
    </article>
  )
}

export function LatestNewsSection({ title, posts, className }: LatestNewsSectionProps) {
  return (
    <section aria-label="Latest news and blogs" className={cn('bg-white', className)}>
      <div className="mx-auto w-full max-w-[1440px] px-4 py-12 sm:px-6 md:px-8 md:py-16 lg:px-9 lg:py-[100px]">
        <ContentSlider
          label="Latest news and blogs"
          controlsClassName="gap-[21px]"
          heading={
            <h2 className="font-sans text-[2rem] leading-10 font-normal tracking-[-1px] text-[#33353F] md:text-5xl md:leading-[56px]">
              {title}
            </h2>
          }
          slideClassName="md:w-[calc((100%-1rem)/2)] min-[1440px]:w-[calc((100%-2rem)/3)]"
        >
          {posts.map((post) => (
            <NewsCard key={post.href} post={post} />
          ))}
        </ContentSlider>
      </div>
    </section>
  )
}
