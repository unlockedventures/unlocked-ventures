export const insightChannels = {
  linkedin: 'https://www.linkedin.com/company/unlocked-ventures',
  youtube: 'https://www.youtube.com/@unlockedventures',
} as const

export type NavLink = {
  label: string
  href: string
  external?: boolean
}

export type NavGroup = {
  title?: string
  links: NavLink[]
}

export type NavItem = {
  label: string
  href: string
  groups: NavGroup[]
}

const solution = (slug: string) => `/solutions/${slug}`

export const primaryNavigation: NavItem[] = [
  {
    label: 'Strategic Advisory',
    href: '/strategic-advisory',
    groups: [
      {
        title: 'Enterprise',
        links: [
          { label: 'Enterprise AI', href: solution('enterprise-ai') },
          { label: 'Market Radar', href: solution('market-radar') },
          { label: 'Strategic Growth', href: solution('strategic-growth') },
          { label: 'New Product Incubation', href: solution('new-product-incubation') },
          { label: 'Digital Transformation', href: solution('digital-transformation') },
        ],
      },
      {
        title: 'Early-stage',
        links: [
          { label: 'Product Strategy', href: solution('product-strategy') },
          { label: 'Market Positioning', href: solution('market-positioning') },
          { label: 'GTM Design', href: solution('gtm-design') },
          { label: 'Business Development', href: solution('business-development') },
          { label: 'Capital Raise', href: solution('capital-raise') },
          {
            label: 'CXO Mentorship and Hiring Support',
            href: solution('cxo-mentorship-and-hiring-support'),
          },
        ],
      },
    ],
  },
  {
    label: 'Digital Engineering',
    href: '/digital-engineering',
    groups: [
      {
        title: 'Enterprise',
        links: [
          { label: 'Workflow Automation', href: solution('workflow-automation') },
          { label: 'New Product Introductions', href: solution('new-product-introductions') },
          { label: 'Build vs Buy vs Partner', href: solution('build-vs-buy-vs-partner') },
        ],
      },
      {
        title: 'Early-stage',
        links: [{ label: 'Engineering as a Service', href: solution('engineering-as-a-service') }],
      },
    ],
  },
  {
    label: 'Our Successes',
    href: '/our-successes',
    groups: [
      {
        links: [
          { label: 'Enterprise', href: '/our-successes/enterprise' },
          { label: 'Early-stage', href: '/our-successes/early-stage' },
        ],
      },
    ],
  },
  {
    label: 'Insights',
    href: '/insights',
    groups: [
      {
        links: [
          { label: 'LinkedIn', href: insightChannels.linkedin, external: true },
          { label: 'Blog', href: '/insights' },
          { label: 'YouTube', href: insightChannels.youtube, external: true },
        ],
      },
    ],
  },
  {
    label: 'Podcast',
    href: '/podcast',
    groups: [
      {
        links: [
          { label: 'Frontier AI', href: '/podcast?category=frontier-ai' },
          { label: 'Small AI', href: '/podcast?category=small-ai' },
        ],
      },
    ],
  },
  {
    label: 'About',
    href: '/about',
    groups: [
      {
        links: [
          { label: 'Meet the Mind Behind', href: '/about#meet-the-mind' },
          { label: 'Experience', href: '/about#experience' },
          { label: 'Contact', href: '/contact' },
          { label: 'Awards and Recognitions', href: '/about#awards' },
        ],
      },
    ],
  },
]
