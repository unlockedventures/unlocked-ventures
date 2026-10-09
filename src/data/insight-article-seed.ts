import type { Payload } from 'payload'

const financeBody = [
  {
    blockType: 'paragraph' as const,
    text: 'Close checklists often live in spreadsheets, inboxes, and tribal knowledge. When teams jump straight to AI for the monthly close, they automate noise instead of work. The faster path is to fix how the close actually runs, then apply automation where it compounds.',
  },
  {
    blockType: 'paragraph' as const,
    text: 'Start by mapping the close as it actually runs today: who waits on whom, which reconciliations are still manual, and where exceptions hide. That map becomes the brief for any AI investment that is meant to survive diligence.',
  },
  {
    blockType: 'heading' as const,
    title: '1. Automating an undocumented process',
  },
  {
    blockType: 'paragraph' as const,
    text: 'If the close only lives in people’s heads, software will copy the mess. Document owners, inputs, deadlines, and exception paths before you introduce models or bots. The documentation is the product until the workflow is stable.',
  },
  {
    blockType: 'quote' as const,
    text: 'We cut four days from the close before we automated anything. Writing the process down made the automation obvious.',
    attribution: 'Controller, mid-market manufacturing company',
  },
  {
    blockType: 'heading' as const,
    title: '2. Data quality as a later problem',
  },
  {
    blockType: 'paragraph' as const,
    text: 'AI does not invent a clean chart of accounts. Duplicate vendors, stale customers, and inconsistent mappings show up as false confidence in dashboards. Treat data cleanup as a first milestone, not a follow-up ticket.',
  },
  {
    blockType: 'list' as const,
    items: [
      { text: 'Consolidate the chart of accounts' },
      { text: 'Clean vendor and customer records' },
      { text: 'Agree on ownership for every key close feed' },
    ],
  },
  {
    blockType: 'paragraph' as const,
    text: 'Once the source systems are trustworthy, AI can accelerate reconciliation and exception triage without inventing a cleaner ledger than the one you actually have.',
  },
  {
    blockType: 'heading' as const,
    title: '3. Leaving workflow out',
  },
  {
    blockType: 'paragraph' as const,
    text: 'A model that drafts a reconciliation still needs a review path, an escalation, and a place the result is stored. Without workflow, AI becomes another inbox. Design the handoffs with the same care as the prompt.',
  },
  {
    blockType: 'heading' as const,
    title: '4. Where to start',
  },
  {
    blockType: 'paragraph' as const,
    text: 'Pick one high-volume, low-judgment task, measure cycle time, then expand. Sponsors care less about the tool than about a close that is shorter, clearer, and auditable.',
  },
]

const charityBody = [
  {
    blockType: 'paragraph' as const,
    text: 'AI is reshaping how charities work and how people donate. The real opportunity lies less in new tools than in clearer decisions about where automation belongs in fundraising, programs, and trust.',
  },
  {
    blockType: 'heading' as const,
    title: '1. Start with donor trust',
  },
  {
    blockType: 'paragraph' as const,
    text: 'Donors notice when outreach feels generic. Use AI to prepare context for fundraisers, not to replace the relationship. Keep human judgment on asks that involve major gifts or sensitive stories.',
  },
  {
    blockType: 'heading' as const,
    title: '2. Measure what changes',
  },
  {
    blockType: 'paragraph' as const,
    text: 'Track time saved, conversion, and retention before and after each experiment. A shorter research cycle is a win only if it leads to better conversations and clearer reporting.',
  },
  {
    blockType: 'quote' as const,
    text: 'The tool did not raise more money. Our team did, once research stopped eating the week.',
    attribution: 'Development director, national nonprofit',
  },
]

const trailerBody = [
  {
    blockType: 'paragraph' as const,
    text: 'You’re ALCOM, a leading manufacturer of top-quality aluminum trailer products. You have expanded production facilities from a single flagship plant to 6 plants across the country. Your business has grown. Now your operational sophistication must follow in tow.',
  },
  {
    blockType: 'heading' as const,
    title: '1. Align plants around one operating rhythm',
  },
  {
    blockType: 'paragraph' as const,
    text: 'Growth across sites creates local workarounds. A shared close calendar, inventory language, and escalation path turned six factories into one company for finance and operations.',
  },
  {
    blockType: 'heading' as const,
    title: '2. Put visibility before new tooling',
  },
  {
    blockType: 'paragraph' as const,
    text: 'Leaders needed a single view of backlog, scrap, and cash. That visibility funded the next wave of automation and supported a $15M revenue lift once capacity was used with intent.',
  },
  {
    blockType: 'list' as const,
    items: [
      { text: 'Standardize KPIs across plants' },
      { text: 'Clarify ownership for exceptions' },
      { text: 'Sequence automation after the operating rhythm is clear' },
    ],
  },
]

const bodiesByHref: Record<string, typeof financeBody> = {
  '/insights/finance-teams-before-ai-can-accelerate-the-close': financeBody,
  '/insights/harnessing-ai-for-charitable-impact': charityBody,
  '/insights/trailer-manufacturer-transformation': trailerBody,
}

export async function seedInsightArticleBodies(payload: Payload) {
  const result = await payload.find({
    collection: 'news-posts',
    limit: 100,
    depth: 0,
  })

  for (const post of result.docs) {
    if (!post.href || (post.body && post.body.length > 0)) continue
    const body = bodiesByHref[post.href]
    if (!body) continue

    await payload.update({
      collection: 'news-posts',
      id: post.id,
      data: { body },
    })
  }
}
