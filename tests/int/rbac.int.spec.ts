import { describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import {
  collectionRBAC,
  globalRBAC,
  hasPermission,
  resolvePrincipal,
  superAdmin,
} from '@/access/rbac'
import { validatePermissions } from '@/access/resources'
import { Users } from '@/collections/Users'
import { dashboardStatsHandler } from '@/endpoints/dashboard-stats'

function request(
  options: {
    superAdmin?: boolean
    active?: boolean
    permissions?: Record<string, object>
    anonymous?: boolean
  } = {},
) {
  const findByID = vi.fn(async ({ collection }: { collection: string }) =>
    collection === 'users'
      ? {
          id: 1,
          active: options.active !== false,
          isSuperAdmin: options.superAdmin === true,
          role: 2,
        }
      : { id: 2, permissions: options.permissions ?? {} },
  )
  return {
    user: options.anonymous ? null : { id: 1, collection: 'users', isSuperAdmin: true },
    payload: { findByID, count: vi.fn(async () => ({ totalDocs: 3 })), logger: { error: vi.fn() } },
  } as unknown as PayloadRequest
}

describe('RBAC server policy', () => {
  it('ignores forged or stale JWT grants and defaults to deny', async () => {
    const req = request()
    expect(await hasPermission(req, 'media', 'delete')).toBe(false)
    expect(await superAdmin({ req })).toBe(false)
  })
  it('grants only the selected operations', async () => {
    const req = request({ permissions: { media: { read: true, create: true } } })
    expect(await hasPermission(req, 'media', 'read')).toBe(true)
    expect(await hasPermission(req, 'media', 'create')).toBe(true)
    expect(await hasPermission(req, 'media', 'update')).toBe(false)
    expect(await hasPermission(req, 'news-posts', 'read')).toBe(false)
  })
  it('allows Super Admins and denies disabled users even with Super Admin status', async () => {
    expect(await hasPermission(request({ superAdmin: true }), 'media', 'delete')).toBe(true)
    expect(await hasPermission(request({ superAdmin: true, active: false }), 'media', 'read')).toBe(
      false,
    )
  })
  it('caches only within the request and observes role changes on the next request', async () => {
    const req = request({ permissions: { media: { read: true } } })
    await hasPermission(req, 'media', 'read')
    await hasPermission(req, 'media', 'update')
    expect(req.payload.findByID).toHaveBeenCalledTimes(2)
    expect(await hasPermission(request(), 'media', 'read')).toBe(false)
  })
  it('allows public content reads, but not anonymous writes or inbox reads', async () => {
    const req = request({ anonymous: true })
    const config = collectionRBAC({ slug: 'media', fields: [] })
    expect(await config.access!.read!({ req })).toBe(true)
    expect(await config.access!.create!({ req })).toBe(false)
    const inbox = collectionRBAC({ slug: 'contact-messages', fields: [] })
    expect(await inbox.access!.read!({ req })).toBe(false)
    expect(await inbox.access!.delete!({ req: request({ superAdmin: true }) })).toBe(false)
  })
  it('enforces signed-in collection and global reads, including direct requests', async () => {
    const req = request()
    const config = collectionRBAC({ slug: 'media', fields: [] })
    expect(await config.access!.read!({ req })).toBe(false)
    const global = globalRBAC({ slug: 'site', fields: [] })
    expect(await global.access!.update!({ req })).toBe(false)
    expect(await global.access!.read!({ req: request({ anonymous: true }) })).toBe(true)
  })
  it('reserves user creation and role assignment for Super Admins', async () => {
    expect(await Users.access!.create!({ req: request() })).toBe(false)
    expect(await Users.access!.create!({ req: request({ superAdmin: true }) })).toBe(true)
  })
  it('does not resolve anonymous principals', async () => {
    expect(await resolvePrincipal(request({ anonymous: true }))).toBeNull()
  })
  it('omits denied dashboard statistics without breaking allowed counts', async () => {
    const req = request({ permissions: { media: { read: true } } })
    const response = await dashboardStatsHandler(req)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ media: 3 })
  })
  it('rejects anonymous statistics access', async () => {
    expect((await dashboardStatsHandler(request({ anonymous: true }))).status).toBe(401)
  })
})

describe('permission matrix validation', () => {
  it('accepts deny-by-default and valid CRUD grants', () => {
    expect(validatePermissions({})).toBe(true)
    expect(validatePermissions({ media: { read: true, update: true } })).toBe(true)
  })
  it('rejects invented resources, privilege escalation, and unsupported operations', () => {
    for (const value of [
      null,
      [],
      { users: { update: true } },
      { roles: { read: true } },
      { media: { publish: true } },
      { site: { delete: true } },
      { 'contact-messages': { create: true } },
      { media: { read: 'true' } },
    ]) {
      expect(validatePermissions(value)).not.toBe(true)
    }
  })
  it('requires read permission for writes', () => {
    expect(validatePermissions({ media: { update: true } })).not.toBe(true)
  })
})
