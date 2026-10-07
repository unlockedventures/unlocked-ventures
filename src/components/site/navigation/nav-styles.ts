import type { NavItem } from '@/config/navigation'

/** Top-level nav row (full header height; underline is on the name span). */
export const primaryItemClassName =
  'relative inline-flex h-full cursor-pointer items-center font-sans text-[14px] leading-[22px] font-medium tracking-normal text-[#5E6572] uppercase antialiased transition-colors duration-300 ease-out hover:text-[#292F35]'

export const primaryItemOpenClassName = 'text-[#292F35]'

export const primaryItemSelectedClassName = 'text-[#292F35]'

/**
 * Underline on the header bottom edge.
 * Width follows the label+chevron row; row uses leading-none so the icon can
 * flex-center against the capital letters.
 */
export const primaryItemNameClassName =
  'relative inline-flex h-full items-center after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-[#292F35] after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.4,0,0.2,1)] after:content-[""] group-hover/nav-item:after:scale-x-100'

export const primaryItemNameActiveClassName = 'after:scale-x-100!'

export function navItemHasChildren(item: { groups: { links: unknown[] }[] }) {
  return item.groups.some((group) => group.links.length > 0)
}

function pathOnly(href: string) {
  try {
    return new URL(href, 'http://local.invalid').pathname.replace(/\/$/, '') || '/'
  } catch {
    return href.split(/[?#]/)[0]?.replace(/\/$/, '') || '/'
  }
}

/** True when the current route belongs to this top-level nav item or one of its children. */
export function isNavItemSelected(pathname: string, item: NavItem) {
  const current = pathname.replace(/\/$/, '') || '/'

  const candidates = [
    item.href,
    ...item.groups.flatMap((group) => group.links.filter((link) => !link.external).map((link) => link.href)),
  ]

  for (const href of candidates) {
    const path = pathOnly(href)
    if (path === '/') continue
    if (current === path || current.startsWith(`${path}/`)) return true
  }

  return false
}
