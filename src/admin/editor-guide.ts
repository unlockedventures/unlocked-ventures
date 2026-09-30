export const adminGroups = {
  homepage: 'Homepage',
  menus: 'Menus',
  pages: 'Pages',
  successStories: 'Success Stories',
  library: 'Library',
  accounts: 'Accounts',
  settings: 'Settings',
} as const

export const adminGroupOrder = [
  adminGroups.homepage,
  adminGroups.pages,
  adminGroups.successStories,
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
  'recent-podcast',
  'podcast-episodes',
  'latest-news',
  'news-posts',
  'locations',
  'navigation',
  'site-header',
  'site-footer',
  'strategic-growth',
  'contact',
  'media',
  'users',
  'site',
]

export const linkHint =
  'A page on this site, such as /contact, or a full address starting with https://'

export const sizeHint = 'Leave this unless the picture looks too big or too small.'
