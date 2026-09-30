'use client'

import { Link, Logout, NavGroup, useAuth, useConfig, useNav } from '@payloadcms/ui'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

import { buildAdminSections } from '@/admin/build-admin-sections'

type AccessMap = Record<string, { read?: boolean } | undefined>

function canReadEntry(permissions: { collections?: AccessMap; globals?: AccessMap } | undefined, kind: 'collection' | 'global', slug: string) {
  if (!permissions) return true
  const access = (kind === 'collection' ? permissions.collections : permissions.globals)?.[slug]
  if (!access) return false
  if (access.read === undefined) return true
  return Boolean(access.read)
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
          {sections.map((section) => (
            <NavGroup key={section.label} label={section.label}>
              {section.links.map((item) => {
                const active =
                  pathname.startsWith(item.href) && ['/', undefined].includes(pathname[item.href.length])
                const label = (
                  <Fragment>
                    {active ? <div className="nav__link-indicator" /> : null}
                    <span className="nav__link-label">{item.label}</span>
                  </Fragment>
                )

                if (pathname === item.href) {
                  return (
                    <div className="nav__link" id={`nav-${item.slug}`} key={item.slug}>
                      {label}
                    </div>
                  )
                }

                return (
                  <Link className="nav__link" href={item.href} id={`nav-${item.slug}`} key={item.slug} prefetch={false}>
                    {label}
                  </Link>
                )
              })}
            </NavGroup>
          ))}
          <div className="nav__controls">
            <Logout />
          </div>
        </nav>
      </div>
    </aside>
  )
}
