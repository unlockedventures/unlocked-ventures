'use client'

import { Link, Logout, useAuth, useConfig, useNav } from '@payloadcms/ui'
import { usePathname, useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useRef, useState } from 'react'

import { buildAdminNav, buildAdminSections, type AdminNavItem } from '@/admin/build-admin-sections'

type AccessMap = Record<string, { read?: boolean } | undefined>

function canReadEntry(
  permissions: { collections?: AccessMap; globals?: AccessMap } | undefined,
  kind: 'collection' | 'global',
  slug: string,
) {
  if (!permissions) return false
  const access = (kind === 'collection' ? permissions.collections : permissions.globals)?.[slug]
  if (!access) return false
  if (access.read === undefined) return false
  return Boolean(access.read)
}

function linkIsCurrent(pathname: string, href: string, search = '') {
  const queryIndex = href.indexOf('?')
  const path = queryIndex === -1 ? href : href.slice(0, queryIndex)
  const query = queryIndex === -1 ? '' : href.slice(queryIndex + 1)
  if (pathname !== path && !pathname.startsWith(`${path}/`)) return false
  if (query)
    return (
      pathname === path &&
      new URLSearchParams(search).toString() === new URLSearchParams(query).toString()
    )
  if (pathname !== path) return true
  return !new URLSearchParams(search).has('where[kind][equals]')
}

function itemContainsPath(item: AdminNavItem, pathname: string, search: string): boolean {
  if (item.kind === 'link') return linkIsCurrent(pathname, item.link.href, search)
  return item.items.some((child) => itemContainsPath(child, pathname, search))
}

function AdminNavLink({
  slug,
  href,
  label,
  pathname,
  search,
  className,
}: {
  slug: string
  href: string
  label: string
  pathname: string
  search: string
  className?: string
}) {
  const active = linkIsCurrent(pathname, href, search)
  const content = (
    <Fragment>
      {active ? <div className="nav__link-indicator" /> : null}
      <span className="nav__link-label">{label}</span>
    </Fragment>
  )
  const linkClassName = ['nav__link', className].filter(Boolean).join(' ')
  const path = href.split('?')[0]

  if (active && pathname === path) {
    return (
      <div className={linkClassName} id={`nav-${slug}`}>
        {content}
      </div>
    )
  }

  return (
    <Link className={linkClassName} href={href} id={`nav-${slug}`} prefetch={false}>
      {content}
    </Link>
  )
}

function AdminNavGroup({
  label,
  items,
  defaultOpen = false,
  nested = false,
  pathname,
  search,
}: {
  label: string
  items: AdminNavItem[]
  defaultOpen?: boolean
  nested?: boolean
  pathname: string
  search: string
}) {
  const sectionId = `admin-nav-${label.toLowerCase().replace(/\s+/g, '-')}`
  const containsCurrent = items.some((item) => itemContainsPath(item, pathname, search))
  const closedByUser = useRef(false)
  const [open, setOpen] = useState(defaultOpen || containsCurrent)

  useEffect(() => {
    closedByUser.current = false
  }, [pathname, search])

  useEffect(() => {
    if (containsCurrent && !closedByUser.current) setOpen(true)
  }, [containsCurrent, pathname, search])

  return (
    <div className={nested ? 'uv-admin-nav__page' : 'uv-admin-nav__group'}>
      <button
        type="button"
        className={nested ? 'uv-admin-nav__page-button' : 'uv-admin-nav__group-button'}
        aria-expanded={open}
        aria-controls={sectionId}
        onClick={() =>
          setOpen((current) => {
            const next = !current
            closedByUser.current = !next
            return next
          })
        }
      >
        <span>{label}</span>
        <svg viewBox="0 0 12 12" aria-hidden="true" className={open ? 'is-open' : undefined}>
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <ul className="uv-admin-nav__items" hidden={!open} id={sectionId}>
        {items.map((item) =>
          item.kind === 'link' ? (
            <li key={item.link.slug}>
              <AdminNavLink
                slug={item.link.slug}
                href={item.link.href}
                label={item.link.label}
                pathname={pathname}
                search={search}
              />
            </li>
          ) : (
            <li key={item.label}>
              <AdminNavGroup
                label={item.label}
                items={item.items}
                defaultOpen={item.defaultOpen}
                nested
                pathname={pathname}
                search={search}
              />
            </li>
          ),
        )}
      </ul>
    </div>
  )
}

export function AdminNav() {
  const pathname = usePathname()
  const search = useSearchParams().toString()
  const { config } = useConfig()
  const { permissions } = useAuth()
  const { hydrated, navOpen, navRef, shouldAnimate } = useNav()
  const sections = buildAdminNav(
    buildAdminSections({
      adminRoute: config.routes.admin,
      collections: config.collections,
      globals: config.globals,
      canRead: (kind, slug) => canReadEntry(permissions, kind, slug),
    }),
  )

  const className = [
    'nav',
    navOpen && 'nav--nav-open',
    shouldAnimate && 'nav--nav-animate',
    hydrated && 'nav--nav-hydrated',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <aside className={className} inert={!navOpen ? true : undefined}>
      <div className="nav__scroll" ref={navRef}>
        <nav className="nav__wrap" aria-label="Website content">
          {sections.map((section) =>
            section.kind === 'group' ? (
              <AdminNavGroup
                key={section.label}
                label={section.label}
                items={section.items}
                defaultOpen={section.defaultOpen}
                pathname={pathname}
                search={search}
              />
            ) : (
              <AdminNavLink
                key={section.link.slug}
                slug={section.link.slug}
                href={section.link.href}
                label={section.link.label}
                pathname={pathname}
                search={search}
                className="uv-admin-nav__direct"
              />
            ),
          )}
          <div className="nav__controls">
            <Logout />
          </div>
        </nav>
      </div>
    </aside>
  )
}
