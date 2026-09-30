'use client'

import { Link, Logout, useAuth, useConfig, useNav } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'

import { buildAdminSections, type AdminSection } from '@/admin/build-admin-sections'

type AccessMap = Record<string, { read?: boolean } | undefined>

function canReadEntry(permissions: { collections?: AccessMap; globals?: AccessMap } | undefined, kind: 'collection' | 'global', slug: string) {
  if (!permissions) return true
  const access = (kind === 'collection' ? permissions.collections : permissions.globals)?.[slug]
  if (!access) return false
  if (access.read === undefined) return true
  return Boolean(access.read)
}

function linkIsCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function AdminNavSection({
  section,
  defaultOpen,
  pathname,
}: {
  section: AdminSection
  defaultOpen: boolean
  pathname: string
}) {
  const sectionId = `admin-nav-${section.label.toLowerCase().replace(/\s+/g, '-')}`
  const containsCurrent = section.links.some((item) => linkIsCurrent(pathname, item.href))
  const [open, setOpen] = useState(defaultOpen || containsCurrent)

  useEffect(() => {
    if (containsCurrent) setOpen(true)
  }, [containsCurrent])

  return (
    <div className="uv-admin-nav__group">
      <button
        type="button"
        className="uv-admin-nav__group-button"
        aria-expanded={open}
        aria-controls={sectionId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{section.label}</span>
        <svg viewBox="0 0 12 12" aria-hidden="true" className={open ? 'is-open' : undefined}>
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <ul className="uv-admin-nav__items" hidden={!open} id={sectionId}>
          {section.links.map((item) => {
            const active = linkIsCurrent(pathname, item.href)
            const label = (
              <Fragment>
                {active ? <div className="nav__link-indicator" /> : null}
                <span className="nav__link-label">{item.label}</span>
              </Fragment>
            )

            return (
              <li key={item.slug}>
                {pathname === item.href ? (
                  <div className="nav__link" id={`nav-${item.slug}`}>
                    {label}
                  </div>
                ) : (
                  <Link className="nav__link" href={item.href} id={`nav-${item.slug}`} prefetch={false}>
                    {label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
    </div>
  )
}

export function AdminNav() {
  const pathname = usePathname()
  const { config } = useConfig()
  const { permissions } = useAuth()
  const { hydrated, navOpen, navRef, shouldAnimate } = useNav()
  const sections = buildAdminSections({
    adminRoute: config.routes.admin,
    collections: config.collections,
    globals: config.globals,
    canRead: (kind, slug) => canReadEntry(permissions, kind, slug),
  })

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
          {sections.map((section, index) => (
            <AdminNavSection
              key={section.label}
              section={section}
              defaultOpen={index === 0}
              pathname={pathname}
            />
          ))}
          <div className="nav__controls">
            <Logout />
          </div>
        </nav>
      </div>
    </aside>
  )
}
