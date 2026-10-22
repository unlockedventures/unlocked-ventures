'use client'

import { Gutter, Link, useAuth, useConfig } from '@payloadcms/ui'
import {
  ArrowUpRight,
  Award,
  Headphones,
  Image,
  Mail,
  Mic,
  Newspaper,
  Radio,
  Users,
} from 'lucide-react'

import { buildAdminNav, buildAdminSections, type AdminNavItem } from '@/admin/build-admin-sections'

import { useDashboardStats } from '@/hooks/queries/use-dashboard-stats'

type AccessMap = Record<string, { read?: boolean } | undefined>

type DashboardStats = Record<string, number>

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

function AdminHomeLinks({ items, stats }: { items: AdminNavItem[]; stats?: DashboardStats }) {
  const links = items.filter((item) => item.kind === 'link')
  const groups = items.filter((item) => item.kind === 'group')

  return (
    <>
      {groups.map((group) => (
        <div key={group.label} className="uv-admin-home__page">
          <h3>{group.label}</h3>

          <AdminHomeLinks items={group.items} stats={stats} />
        </div>
      ))}

      {links.length > 0 && (
        <ul className="uv-admin-home__list">
          {links.map((item) => {
            const count = stats?.[item.link.slug]

            return (
              <li key={item.link.slug}>
                <Link className="uv-admin-home__card" href={item.link.href} prefetch={false}>
                  <strong>{item.link.label}</strong>

                  {item.link.description && <span>{item.link.description}</span>}

                  {count !== undefined && (
                    <span className="uv-admin-home__count">{count?.toLocaleString()} entries</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

const statItems = [
  { key: 'users', icon: Users, label: 'Users', href: '/admin/collections/users' },
  { key: 'media', icon: Image, label: 'Media', href: '/admin/collections/media' },
  { key: 'awards', icon: Award, label: 'Awards', href: '/admin/collections/awards' },
  {
    key: 'news-posts',
    icon: Newspaper,
    label: 'News Posts',
    href: '/admin/collections/news-posts',
  },
  {
    key: 'podcast-audio',
    icon: Headphones,
    label: 'Podcast Audio',
    href: '/admin/collections/podcast-audio',
  },
  {
    key: 'podcast-channels',
    icon: Radio,
    label: 'Podcast Channels',
    href: '/admin/collections/podcast-channels',
  },
  {
    key: 'podcast-episodes',
    icon: Mic,
    label: 'Podcast Episodes',
    href: '/admin/collections/podcast-episodes',
  },
  {
    key: 'contact-messages',
    icon: Mail,
    label: 'Contact Messages',
    href: '/admin/collections/contact-messages',
  },
] as const

export function AdminHome() {
  const { config } = useConfig()
  const { permissions } = useAuth()

  const { data: stats, isPending, isError, error, refetch } = useDashboardStats()

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
        <span className="uv-admin-home__eyebrow">Unlocked Ventures · Content studio</span>
        <h1>Dashboard</h1>
        <p>Manage your website content, media, and podcast episodes in one place.</p>
      </header>

      {/* Overview Statistics */}
      <section className="uv-dashboard-stats" aria-labelledby="dashboard-stats-heading">
        <h2 id="dashboard-stats-heading">Overview</h2>

        {isPending ? (
          <p role="status">Loading dashboard statistics...</p>
        ) : isError ? (
          <div role="alert">
            <p>Unable to load dashboard statistics.</p>

            <button type="button" onClick={() => refetch()}>
              Try again
            </button>

            {process.env.NODE_ENV === 'development' && <p>{error.message}</p>}
          </div>
        ) : (
          <ul className="uv-dashboard-stats__grid">
            {statItems
              .filter((item) => stats[item.key] !== undefined)
              .map((item) => {
                const count = stats[item.key]
                const Icon = item.icon

                return (
                  <li key={item.key} className="uv-dashboard-stats__item">
                    <Link href={item.href} prefetch={false} className="uv-dashboard-stats__card">
                      <span className="uv-dashboard-stats__card-top" aria-hidden="true">
                        <span className="uv-dashboard-stats__icon">
                          <Icon size={20} strokeWidth={1.6} />
                        </span>
                        <ArrowUpRight className="uv-dashboard-stats__arrow" size={18} />
                      </span>
                      <strong className="uv-dashboard-stats__label">{item.label}</strong>

                      <span className="uv-dashboard-stats__value">{count?.toLocaleString()}</span>

                      <span className="uv-dashboard-stats__description">Total entries</span>
                    </Link>
                  </li>
                )
              })}
          </ul>
        )}
      </section>

      {/* Admin Navigation Sections */}
      {/* {sections.map((section) => {
        if (section.kind === 'link') {
          const count = !isPending && !isError ? stats[section.link.slug] : undefined

          return (
            <ul key={section.link.slug} className="uv-admin-home__list">
              <li>
                <Link className="uv-admin-home__card" href={section.link.href} prefetch={false}>
                  <strong>{section.link.label}</strong>

                  {section.link.description && <span>{section.link.description}</span>}

                  {count !== undefined && (
                    <span className="uv-admin-home__count">{count?.toLocaleString()} entries</span>
                  )}
                </Link>
              </li>
            </ul>
          )
        }

        return (
          <section
            key={section.label}
            className="uv-admin-home__group"
            aria-labelledby={`admin-group-${section.label}`}
          >
            <h2 id={`admin-group-${section.label}`}>{section.label}</h2>

            <div className="uv-admin-home__nested">
              <AdminHomeLinks
                items={section.items}
                stats={!isPending && !isError ? stats : undefined}
              />
            </div>
          </section>
        )
      })} */}
    </Gutter>
  )
}
