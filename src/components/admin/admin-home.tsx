'use client'

import { Gutter, Link, useAuth, useConfig } from '@payloadcms/ui'

import { buildAdminNav, buildAdminSections, type AdminNavItem } from '@/admin/build-admin-sections'

type AccessMap = Record<string, { read?: boolean } | undefined>

function canReadEntry(permissions: { collections?: AccessMap; globals?: AccessMap } | undefined, kind: 'collection' | 'global', slug: string) {
  if (!permissions) return true
  const access = (kind === 'collection' ? permissions.collections : permissions.globals)?.[slug]
  if (!access) return false
  if (access.read === undefined) return true
  return Boolean(access.read)
}

function AdminHomeLinks({ items }: { items: AdminNavItem[] }) {
  const links = items.filter((item) => item.kind === 'link')
  const groups = items.filter((item) => item.kind === 'group')

  return (
    <>
      {groups.map((group) => (
        <div key={group.label} className="uv-admin-home__page">
          <h3>{group.label}</h3>
          <AdminHomeLinks items={group.items} />
        </div>
      ))}
      {links.length > 0 ? (
        <ul className="uv-admin-home__list">
          {links.map((item) => (
            <li key={item.link.slug}>
              <Link className="uv-admin-home__card" href={item.link.href} prefetch={false}>
                <strong>{item.link.label}</strong>
                {item.link.description ? <span>{item.link.description}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

export function AdminHome() {
  const { config } = useConfig()
  const { permissions } = useAuth()
  const sections = buildAdminNav(
    buildAdminSections({
      adminRoute: config.routes.admin,
      collections: config.collections,
      globals: config.globals,
      canRead: (kind, slug) => canReadEntry(permissions, kind, slug),
    }),
  )

  return (
    <Gutter className="dashboard uv-admin-home">
      <header className="uv-admin-home__intro">
        <h1>Edit the website</h1>
        <p>
          Each item below matches a part of the public site, and the menu on the left uses the same names. Open a
          section, change the words or pictures, then press Save. The live site updates after you save.
        </p>
      </header>
      {sections.map((section) => {
        if (section.kind === 'link') {
          return (
            <ul key={section.link.slug} className="uv-admin-home__list">
              <li>
                <Link className="uv-admin-home__card" href={section.link.href} prefetch={false}>
                  <strong>{section.link.label}</strong>
                  {section.link.description ? <span>{section.link.description}</span> : null}
                </Link>
              </li>
            </ul>
          )
        }

        return (
          <section key={section.label} className="uv-admin-home__group" aria-labelledby={`admin-group-${section.label}`}>
            <h2 id={`admin-group-${section.label}`}>{section.label}</h2>
            <div className="uv-admin-home__nested">
              <AdminHomeLinks items={section.items} />
            </div>
          </section>
        )
      })}
    </Gutter>
  )
}
