/** Integration smoke check: creates temporary fixtures, verifies access, and cleans up. */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const resolvedConfig = await config
const payload = await getPayload({ config: { ...resolvedConfig, onInit: undefined } })
let roleId: number | undefined
let userId: number | undefined
try {
  const owners = await payload.find({
    collection: 'users',
    where: { and: [{ isSuperAdmin: { equals: true } }, { active: { equals: true } }] },
    limit: 1,
    depth: 0,
  })
  assert(owners.docs[0], 'An active Super Admin is required')
  const owner = { ...owners.docs[0], collection: 'users' as const }
  const suffix = randomUUID()
  const role = await payload.create({
    collection: 'roles',
    user: owner,
    overrideAccess: false,
    data: { name: `RBAC smoke ${suffix}`, permissions: { media: { read: true } } },
  })
  roleId = role.id
  const editor = await payload.create({
    collection: 'users',
    user: owner,
    overrideAccess: false,
    data: {
      email: `rbac-${suffix}@example.invalid`,
      password: randomUUID(),
      active: true,
      isSuperAdmin: false,
      role: role.id,
    },
  })
  userId = editor.id
  const user = { ...editor, collection: 'users' as const }
  await payload.find({ collection: 'media', user, overrideAccess: false, limit: 1 })
  await assert.rejects(
    payload.find({ collection: 'news-posts', user, overrideAccess: false }),
    (error: unknown) =>
      Boolean(error && typeof error === 'object' && 'status' in error && error.status === 403),
  )
  await assert.rejects(
    payload.create({
      collection: 'roles',
      user,
      overrideAccess: false,
      data: { name: `Forbidden ${suffix}`, permissions: {} },
    }),
  )
  const updated = await payload.update({
    collection: 'users',
    id: editor.id,
    user,
    overrideAccess: false,
    data: { isSuperAdmin: true, active: true },
  })
  assert.equal(updated.isSuperAdmin, false, 'Users must not promote themselves')
  await payload.update({
    collection: 'roles',
    id: role.id,
    user: owner,
    overrideAccess: false,
    data: { permissions: {} },
  })
  await assert.rejects(payload.find({ collection: 'media', user, overrideAccess: false }))
  await payload.update({
    collection: 'users',
    id: editor.id,
    user: owner,
    overrideAccess: false,
    data: { active: false },
  })
  await assert.rejects(
    payload.update({
      collection: 'users',
      id: editor.id,
      user,
      overrideAccess: false,
      data: { email: `disabled-${suffix}@example.invalid` },
    }),
  )
  console.log(
    'RBAC database smoke checks passed: grants, denials, privilege protection, role revocation, disabled account.',
  )
} finally {
  if (userId) await payload.delete({ collection: 'users', id: userId, overrideAccess: true })
  if (roleId) await payload.delete({ collection: 'roles', id: roleId, overrideAccess: true })
  await Promise.race([payload.destroy(), new Promise((resolve) => setTimeout(resolve, 1000))])
}

process.exit(0)
