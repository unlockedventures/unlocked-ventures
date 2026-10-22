'use client'

import { FieldError, useField } from '@payloadcms/ui'
import { useId } from 'react'
import {
  allowedOperations,
  operations,
  permissionResources,
  type Operation,
  type Permissions,
} from '@/access/resources'

export function PermissionsField({ path, readOnly }: { path: string; readOnly?: boolean }) {
  const { value, setValue } = useField<Permissions>({ path })
  const id = useId()
  function toggle(slug: string, operation: Operation, checked: boolean) {
    const grants = { ...value?.[slug], [operation]: checked }
    if (operation !== 'read' && checked) grants.read = true
    if (operation === 'read' && !checked)
      Object.assign(grants, { create: false, update: false, delete: false })
    const resource = permissionResources.find((item) => item.slug === slug)!
    const filtered = Object.fromEntries(
      allowedOperations(resource.kind).map((op) => [op, grants[op] === true]),
    )
    setValue({ ...value, [slug]: filtered })
  }
  return (
    <div className="uv-permissions">
      <h3 id={`${id}-title`}>Content permissions</h3>
      <p>
        Grant only what this role needs. Write access includes read access. User and role management
        belong to Super Admins.
      </p>
      <div className="uv-permissions__scroll">
        <table aria-labelledby={`${id}-title`}>
          <thead>
            <tr>
              <th scope="col">Resource</th>
              {operations.map((op) => (
                <th key={op} scope="col">
                  {op}
                </th>
              ))}
              <th scope="col">All</th>
            </tr>
          </thead>
          <tbody>
            {permissionResources.map((resource) => {
              const allowed = allowedOperations(resource.kind)
              return (
                <tr key={resource.slug}>
                  <th scope="row">
                    {resource.label}
                    {resource.kind === 'global' && <small>Page / section</small>}
                  </th>
                  {operations.map((op) => (
                    <td key={op}>
                      {allowed.includes(op) ? (
                        <input
                          type="checkbox"
                          aria-label={`${resource.label}: ${op}`}
                          checked={value?.[resource.slug]?.[op] === true}
                          disabled={readOnly}
                          onChange={(e) => toggle(resource.slug, op, e.target.checked)}
                        />
                      ) : (
                        <span aria-label="Not applicable">—</span>
                      )}
                    </td>
                  ))}
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`${resource.label}: all applicable permissions`}
                      checked={allowed.every((op) => value?.[resource.slug]?.[op] === true)}
                      disabled={readOnly}
                      onChange={(e) =>
                        setValue({
                          ...value,
                          [resource.slug]: Object.fromEntries(
                            allowed.map((op) => [op, e.target.checked]),
                          ),
                        })
                      }
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <FieldError path={path} />
    </div>
  )
}
