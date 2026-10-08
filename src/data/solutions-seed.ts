export type SolutionSeed = {
  slug: string
  category: 'strategic-advisory' | 'digital-engineering'
  current: string
  title: string
  description: string
  engagementTitle: string
  engagementItems: readonly { number: string; title: string; body: string }[]
  howWeWorkTitle: string
  steps: readonly { number: string; title: string; body: string }[]
  ctaTitle: string
  ctaDescription: string
  cta: { label: string; href: string }
  relatedTitle: string
  relatedSlugs: readonly string[]
}

const sharedCta = {
  ctaTitle: 'Tell us what you are trying to build.',
  ctaDescription:
    'Share the outcome you need and the constraints you are working with. We will come back with a clear next step, not a deck.',
  cta: {
    label: 'Get in touch',
    href: '/contact',
  },
  relatedTitle: 'Related solutions',
} as const

const advisoryHowWeWork = {
  howWeWorkTitle: 'How we work',
  steps: [
    {
      number: '1',
      title: 'Assess',
      body: 'A short, senior review of the stack, the team, and the thesis it has to support.',
    },
    {
      number: '2',
      title: 'Prioritise',
      body: 'Initiatives sized against EBITDA and cut to the few worth funding this year.',
    },
    {
      number: '3',
      title: 'Mobilise',
      body: 'Owners named, budgets set, and delivery started before the plan goes stale.',
    },
    {
      number: '4',
      title: 'Review',
      body: 'Quarterly checkpoints with the board, and honest recommendations to stop what is not working.',
    },
  ],
} as const

const engineeringHowWeWork = {
  howWeWorkTitle: 'How we work',
  steps: [
    {
      number: '1',
      title: 'Scope',
      body: 'We define the outcome, constraints, and success metrics with the people who own the result.',
    },
    {
      number: '2',
      title: 'Design',
      body: 'Architecture, interfaces, and delivery plan written so engineering and the business stay aligned.',
    },
    {
      number: '3',
      title: 'Build',
      body: 'Senior engineers ship in short cycles with visible demos and no black-box handoffs.',
    },
    {
      number: '4',
      title: 'Hand over',
      body: 'Documented, tested systems your team can run — with support available when you still want it.',
    },
  ],
} as const

const relatedBodies: Record<string, string> = {
  'product-strategy':
    'Clarify what to build, for whom, and why it wins — before engineering spend locks in the wrong bet.',
  'market-positioning':
    'Position the offer so buyers understand the value without a 40-slide explanation.',
  'engineering-as-a-service':
    'Embedded product and engineering capacity that ships with your roadmap, not beside it.',
  'strategic-growth':
    'Advising that holds up once the plan meets the business — from diligence through early ownership.',
  'enterprise-ai':
    'Where AI earns its cost in the enterprise, sequenced against real operating constraints.',
  'market-radar':
    'Signal on markets, competitors, and adjacent opportunities before the window closes.',
  'digital-transformation':
    'Operating model and technology change tied to measurable value, not a tooling catalogue.',
  'workflow-automation':
    'Automate the work that burns time and margin — with controls finance and ops can trust.',
  'new-product-introductions':
    'Take a product from concept to launch with engineering, GTM, and ops in one plan.',
  'build-vs-buy-vs-partner':
    'A clear recommendation on build, buy, or partner — priced against time, risk, and ownership.',
}

function advisoryEngagement(focus: string) {
  return {
    engagementTitle: 'What the engagement covers',
    engagementItems: [
      {
        number: '01',
        title: 'Discovery and framing',
        body: `A clear read on the problem, the stakeholders, and the constraints around ${focus}.`,
      },
      {
        number: '02',
        title: 'Options and recommendation',
        body: 'Trade-offs sized for an investment committee or leadership team — not a wishlist.',
      },
      {
        number: '03',
        title: 'Value and sequencing',
        body: 'Initiatives priced, ordered, and tied to owners and milestones the board can track.',
      },
      {
        number: '04',
        title: 'Executive support',
        body: 'Standing access to senior advisors through the messy middle of execution, not just kickoff.',
      },
    ],
  }
}

function engineeringEngagement(focus: string) {
  return {
    engagementTitle: 'What the engagement covers',
    engagementItems: [
      {
        number: '01',
        title: 'Outcome definition',
        body: `Agree what success looks like for ${focus} before a line of code is written.`,
      },
      {
        number: '02',
        title: 'Architecture and plan',
        body: 'A build path that matches your stack, team, and timeline — with risk called out early.',
      },
      {
        number: '03',
        title: 'Delivery',
        body: 'Cross-functional engineering that ships in visible increments your stakeholders can judge.',
      },
      {
        number: '04',
        title: 'Operate and improve',
        body: 'Handover, documentation, and iteration so the system keeps earning its keep.',
      },
    ],
  }
}

function solution(
  partial: Pick<SolutionSeed, 'slug' | 'category' | 'current' | 'title' | 'description' | 'relatedSlugs'> & {
    focus: string
  },
): SolutionSeed {
  const isEngineering = partial.category === 'digital-engineering'
  return {
    slug: partial.slug,
    category: partial.category,
    current: partial.current,
    title: partial.title,
    description: partial.description,
    ...(isEngineering ? engineeringEngagement(partial.focus) : advisoryEngagement(partial.focus)),
    ...(isEngineering ? engineeringHowWeWork : advisoryHowWeWork),
    ...sharedCta,
    relatedSlugs: partial.relatedSlugs,
  }
}

export const solutionsAssetPaths = {
  illustration: '/solutions/strategic-growth/hero-illustration.svg',
  heroImage: '/solutions/strategic-growth/hero-photo.png',
  icons: {
    'product-strategy': {
      file: '/solutions/strategic-growth/icon-product-strategy.svg',
      width: 80,
      height: 79,
    },
    'market-positioning': {
      file: '/solutions/strategic-growth/icon-market-positioning.svg',
      width: 73,
      height: 79,
    },
    'engineering-as-a-service': {
      file: '/solutions/strategic-growth/icon-engineering-as-a-service.svg',
      width: 80,
      height: 80,
    },
  },
} as const

export const solutionsSeed: readonly SolutionSeed[] = [
  solution({
    slug: 'enterprise-ai',
    category: 'strategic-advisory',
    current: 'Enterprise AI',
    title: 'AI that earns its place in the operating plan',
    description:
      'We help sponsors and operators decide where AI creates value, what to fund first, and how to govern it — so pilots stop dying in slideware.',
    focus: 'enterprise AI',
    relatedSlugs: ['strategic-growth', 'digital-transformation', 'workflow-automation'],
  }),
  solution({
    slug: 'market-radar',
    category: 'strategic-advisory',
    current: 'Market Radar',
    title: 'See the market clearly before you commit capital',
    description:
      'Competitive and adjacency signal for PE and growth teams who need a decision-ready view, not another research binder.',
    focus: 'market radar',
    relatedSlugs: ['strategic-growth', 'market-positioning', 'product-strategy'],
  }),
  solution({
    slug: 'strategic-growth',
    category: 'strategic-advisory',
    current: 'Strategic Growth',
    title: 'Advising that holds up once the plan meets the business',
    description:
      'Leading-edge AI and tech capabilities applied to your value creation plan at scale — from diligence through the first two years of ownership, with the same people in the room throughout.',
    focus: 'strategic growth',
    relatedSlugs: ['product-strategy', 'market-positioning', 'engineering-as-a-service'],
  }),
  solution({
    slug: 'new-product-incubation',
    category: 'strategic-advisory',
    current: 'New Product Incubation',
    title: 'Incubate the next offer without distracting the core',
    description:
      'From thesis to first customers — with product, technology, and GTM decisions made together so incubation does not become a side project.',
    focus: 'new product incubation',
    relatedSlugs: ['product-strategy', 'new-product-introductions', 'gtm-design'],
  }),
  solution({
    slug: 'digital-transformation',
    category: 'strategic-advisory',
    current: 'Digital Transformation',
    title: 'Transformation tied to value, not a tooling catalogue',
    description:
      'We redesign how work gets done and which systems support it — sequenced against EBITDA, risk, and the team that has to live with the change.',
    focus: 'digital transformation',
    relatedSlugs: ['enterprise-ai', 'workflow-automation', 'strategic-growth'],
  }),
  solution({
    slug: 'product-strategy',
    category: 'strategic-advisory',
    current: 'Product Strategy',
    title: 'Product bets that survive contact with the market',
    description:
      'Clarify what to build, for whom, and why it wins — before engineering spend locks in the wrong bet.',
    focus: 'product strategy',
    relatedSlugs: ['market-positioning', 'gtm-design', 'strategic-growth'],
  }),
  solution({
    slug: 'market-positioning',
    category: 'strategic-advisory',
    current: 'Market Positioning',
    title: 'Positioning buyers understand without a 40-slide deck',
    description:
      'We sharpen the category story, differentiation, and proof points so sales and product pull in the same direction.',
    focus: 'market positioning',
    relatedSlugs: ['product-strategy', 'gtm-design', 'business-development'],
  }),
  solution({
    slug: 'gtm-design',
    category: 'strategic-advisory',
    current: 'GTM Design',
    title: 'A go-to-market motion that matches the product',
    description:
      'Channels, packaging, and sales motion designed around how your buyers actually buy — not a generic playbook.',
    focus: 'GTM design',
    relatedSlugs: ['market-positioning', 'business-development', 'product-strategy'],
  }),
  solution({
    slug: 'business-development',
    category: 'strategic-advisory',
    current: 'Business Development',
    title: 'Partnerships and pipeline with an operator’s discipline',
    description:
      'We help early-stage and growth teams open the right doors, structure deals, and build repeatable BD habits.',
    focus: 'business development',
    relatedSlugs: ['gtm-design', 'capital-raise', 'market-positioning'],
  }),
  solution({
    slug: 'capital-raise',
    category: 'strategic-advisory',
    current: 'Capital Raise',
    title: 'Fundraising materials and narrative investors can diligence',
    description:
      'Story, metrics, and materials prepared so you spend time with the right investors — and answer the hard questions cleanly.',
    focus: 'capital raise',
    relatedSlugs: ['business-development', 'product-strategy', 'strategic-growth'],
  }),
  solution({
    slug: 'cxo-mentorship-and-hiring-support',
    category: 'strategic-advisory',
    current: 'CXO Mentorship and Hiring Support',
    title: 'Senior guidance when the next hire has to be right',
    description:
      'Mentorship for founding and portfolio CXOs, plus hiring support for roles that shape the company’s next chapter.',
    focus: 'CXO mentorship and hiring',
    relatedSlugs: ['product-strategy', 'strategic-growth', 'engineering-as-a-service'],
  }),
  solution({
    slug: 'workflow-automation',
    category: 'digital-engineering',
    current: 'Workflow Automation',
    title: 'Automate the work that burns time and margin',
    description:
      'We design and ship automation finance and operations can trust — with controls, observability, and owners named from day one.',
    focus: 'workflow automation',
    relatedSlugs: ['build-vs-buy-vs-partner', 'enterprise-ai', 'engineering-as-a-service'],
  }),
  solution({
    slug: 'new-product-introductions',
    category: 'digital-engineering',
    current: 'New Product Introductions',
    title: 'From concept to launch without losing the plot',
    description:
      'Engineering, product, and launch readiness in one plan so new introductions ship as a business event, not a code drop.',
    focus: 'new product introductions',
    relatedSlugs: ['new-product-incubation', 'product-strategy', 'engineering-as-a-service'],
  }),
  solution({
    slug: 'build-vs-buy-vs-partner',
    category: 'digital-engineering',
    current: 'Build vs Buy vs Partner',
    title: 'A clear call on build, buy, or partner',
    description:
      'We price time, risk, and ownership so leadership can choose the path that fits the thesis — then help execute it.',
    focus: 'build vs buy vs partner',
    relatedSlugs: ['workflow-automation', 'engineering-as-a-service', 'digital-transformation'],
  }),
  solution({
    slug: 'engineering-as-a-service',
    category: 'digital-engineering',
    current: 'Engineering as a Service',
    title: 'Embedded engineering that ships with your roadmap',
    description:
      'Senior product and engineering capacity that works inside your process — accountable to outcomes, not ticket volume.',
    focus: 'engineering as a service',
    relatedSlugs: ['workflow-automation', 'new-product-introductions', 'product-strategy'],
  }),
]

export function relatedBodyFor(slug: string) {
  return relatedBodies[slug] ?? 'See how this solution fits alongside the work you are already planning.'
}

export function iconKeyFor(slug: string): keyof typeof solutionsAssetPaths.icons {
  if (slug in solutionsAssetPaths.icons) {
    return slug as keyof typeof solutionsAssetPaths.icons
  }
  if (slug.includes('market') || slug.includes('positioning') || slug.includes('gtm')) {
    return 'market-positioning'
  }
  if (
    slug.includes('engineering') ||
    slug.includes('workflow') ||
    slug.includes('build') ||
    slug.includes('product-introductions')
  ) {
    return 'engineering-as-a-service'
  }
  return 'product-strategy'
}
