export const adminGroups = {
  homepage: 'Homepage',
  menus: 'Menus',
  pages: 'Pages',
  successStories: 'Success Stories',
  dynamicZone: 'Dynamic Zone',
  podcast: 'Podcast',
  news: 'News and blogs',
  pipeline: 'Pipeline',
  library: 'Library',
  accounts: 'Accounts',
  settings: 'Settings',
} as const

export const adminGroupOrder = [
  adminGroups.homepage,
  adminGroups.pages,
  adminGroups.successStories,
  adminGroups.dynamicZone,
  adminGroups.podcast,
  adminGroups.news,
  adminGroups.pipeline,
  adminGroups.menus,
  adminGroups.library,
  adminGroups.accounts,
  adminGroups.settings,
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
  'podcast-listing',
  'podcast-page',
  'podcast-channels',
  'podcast-episodes',
  'latest-news',
  'insights',
  'news-posts',
  'pipeline',
  'locations',
  'navigation',
  'site-header',
  'site-footer',
  'solutions',
  'strategic-growth',
  'about',
  'our-successes',
  'contact',
  'media',
  'users',
  'site',
]

export const linkHint =
  'A page on this site, such as /contact, or a full address starting with https://'

export const sizeHint = 'Leave this unless the picture looks too big or too small.'
