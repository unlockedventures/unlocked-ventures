import type { Access, CollectionConfig, GlobalConfig, PayloadRequest } from 'payload'
import type { Permissions, Operation } from './resources'

type Principal = {
  id: number | string
  active?: boolean | null
  isSuperAdmin?: boolean | null
  role?: number | { id: number } | null
}
type Resolved = { user: Principal; permissions: Permissions } | null
const requests = new WeakMap<PayloadRequest, Promise<Resolved>>()

/** Resolve from the database, never from role claims in a stale JWT. Cache only per request. */
export function resolvePrincipal(req: PayloadRequest): Promise<Resolved> {
  const cached = requests.get(req)
  if (cached) return cached
  const result = (async (): Promise<Resolved> => {
    if (!req.user || req.user.collection !== 'users') return null
    const user = (await req.payload.findByID({
      collection: 'users',
      id: req.user.id,
      depth: 0,
      overrideAccess: true,
      req,
      disableErrors: true,
    })) as Principal | null
    if (!user || user.active !== true) return null
    if (user.isSuperAdmin) return { user, permissions: {} }
    const roleId = typeof user.role === 'object' ? user.role?.id : user.role
    if (!roleId) return { user, permissions: {} }
    const role = await req.payload.findByID({
      collection: 'roles',
      id: roleId,
      depth: 0,
      overrideAccess: true,
      req,
      disableErrors: true,
    })
    return { user, permissions: (role?.permissions ?? {}) as Permissions }
  })()
  requests.set(req, result)
  return result
}

export async function hasPermission(
  req: PayloadRequest,
  slug: string,
  operation: Operation,
): Promise<boolean> {
  const principal = await resolvePrincipal(req)
  return Boolean(
    principal && (principal.user.isSuperAdmin || principal.permissions[slug]?.[operation] === true),
  )
}

export const superAdmin: Access = async ({ req }) =>
  Boolean((await resolvePrincipal(req))?.user.isSuperAdmin)
export const permission =
  (slug: string, operation: Operation): Access =>
  ({ req }) =>
    hasPermission(req, slug, operation)

/** Anonymous content reads serve the public site; signed-in requests use their role. */
export function collectionRBAC(config: CollectionConfig): CollectionConfig {
  if (config.slug === 'users' || config.slug === 'roles') return config
  const inbox = config.slug === 'contact-messages'
  return {
    ...config,
    access: {
      ...config.access,
      read: async ({ req }) =>
        !req.user && !inbox ? true : hasPermission(req, config.slug, 'read'),
      create: inbox ? () => false : permission(config.slug, 'create'),
      update: inbox ? () => false : permission(config.slug, 'update'),
      delete: inbox ? () => false : permission(config.slug, 'delete'),
    },
  }
}

export function globalRBAC(config: GlobalConfig): GlobalConfig {
  return {
    ...config,
    access: {
      ...config.access,
      read: ({ req }) => (!req.user ? true : hasPermission(req, config.slug, 'read')),
      update: permission(config.slug, 'update'),
    },
  }
}
