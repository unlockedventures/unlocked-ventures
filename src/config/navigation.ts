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
