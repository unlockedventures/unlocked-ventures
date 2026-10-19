export const adminGroups = {
  homepage: 'Homepage',
  menus: 'Menus',
  pages: 'Pages',
  successStories: 'Success Stories',
  solutions: 'Solutions',
  dynamicZone: 'Dynamic Zone',
  podcast: 'Podcast',
  news: 'News and blogs',
  library: 'Library',
  accounts: 'Accounts',
  settings: 'Settings',
  inbox: 'Inbox',
} as const

export const adminGroupOrder = [
  adminGroups.homepage,
  adminGroups.pages,
  adminGroups.solutions,
  adminGroups.successStories,
  adminGroups.dynamicZone,
  adminGroups.podcast,
  adminGroups.news,
  adminGroups.menus,
  adminGroups.library,
  adminGroups.accounts,
  adminGroups.settings,
  adminGroups.inbox,
]

export const adminSlugOrder = [
  'hero',
  'trusted-by',
  'trusted-logos',
  'strategic-advisory',
  'digital-engineering',
  'success-stories',
  'case-studies',
  'awards',
  'awards-section',
  'recent-podcast',
  'podcast-channels',
  'podcast-episodes',
  'latest-news',
  'news-posts',
  'locations',
  'navigation',
  'site-header',
  'site-footer',
  'solutions',
  'strategic-growth',
  'about',
  'podcast-page',
  'podcast-listing',
  'insights',
  'our-successes',
  'contact',
  'media',
  'users',
  'site',
  'contact-messages',
]

export const linkHint =
  'A page on this site, such as /contact, or a full address starting with https://'

export const sizeHint = 'Leave this unless the picture looks too big or too small.'
