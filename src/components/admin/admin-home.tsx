'use client'

import { Gutter, Link, useAuth, useConfig } from '@payloadcms/ui'

import { buildAdminSections } from '@/admin/build-admin-sections'

type AccessMap = Record<string, { read?: boolean } | undefined>

function canReadEntry(permissions: { collections?: AccessMap; globals?: AccessMap } | undefined, kind: 'collection' | 'global', slug: string) {
  if (!permissions) return true
  const access = (kind === 'collection' ? permissions.collections : permissions.globals)?.[slug]
  if (!access) return false
  if (access.read === undefined) return true
  return Boolean(access.read)
}

export function AdminHome() {
  const { config } = useConfig()
  const { permissions } = useAuth()
  const sections = buildAdminSections({
    adminRoute: config.routes.admin,
    collections: config.collections,
    globals: config.globals,
    canRead: (kind, slug) => canReadEntry(permissions, kind, slug),
  })

  return (
    <Gutter className="dashboard uv-admin-home">
      <header className="uv-admin-home__intro">
        <h1>Edit the website</h1>
        <p>
          Each item below matches a part of the public site, and the menu on the left uses the same names. Open a
          section, change the words or pictures, then press Save. The live site updates after you save.
        </p>
      </header>
      {sections.map((section) => (
        <section key={section.label} className="uv-admin-home__group" aria-labelledby={`admin-group-${section.label}`}>
          <h2 id={`admin-group-${section.label}`}>{section.label}</h2>
          <ul className="uv-admin-home__list">
            {section.links.map((item) => (
              <li key={item.slug}>
                <Link className="uv-admin-home__card" href={item.href} prefetch={false}>
                  <strong>{item.label}</strong>
                  {item.description ? <span>{item.description}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Gutter>
  )
}
