import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import type { Payload } from 'payload'

type LexicalNode = {
  type?: string
  value?: unknown
  children?: LexicalNode[]
  [key: string]: unknown
}

type MediaDoc = {
  id?: number | string
  url?: string | null
  alt?: string | null
  filename?: string | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
  sizes?: Record<string, unknown> | null
}

function walk(node: LexicalNode, visit: (node: LexicalNode) => void) {
  visit(node)
  for (const child of node.children ?? []) walk(child, visit)
}

function uploadId(value: unknown): number | string | null {
  if (typeof value === 'number' || typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return id
  }
  return null
}

function needsPopulate(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'number' || typeof value === 'string') return true
  if (typeof value === 'object') {
    const doc = value as MediaDoc
    return !doc.url
  }
  return false
}

function collectUploadIds(root: LexicalNode): Array<number | string> {
  const ids = new Set<number | string>()
  walk(root, (node) => {
    if (node.type !== 'upload') return
    if (!needsPopulate(node.value)) return
    const id = uploadId(node.value)
    if (id != null) ids.add(id)
  })
  return [...ids]
}

function applyMedia(root: LexicalNode, byId: Map<string, MediaDoc>) {
  walk(root, (node) => {
    if (node.type !== 'upload') return
    const id = uploadId(node.value)
    if (id == null) return
    const doc = byId.get(String(id))
    if (doc) node.value = doc
  })
}

/** Client-side: fetch media docs so Lexical upload nodes convert to real <img> tags. */
export async function populateLexicalUploadsClient(
  data: DefaultTypedEditorState,
): Promise<DefaultTypedEditorState> {
  const clone = structuredClone(data) as DefaultTypedEditorState & { root: LexicalNode }
  const ids = collectUploadIds(clone.root)
  if (ids.length === 0) return clone

  const entries = await Promise.all(
    ids.map(async (id) => {
      try {
        const response = await fetch(`/api/media/${id}?depth=0`, { credentials: 'include' })
        if (!response.ok) return null
        const doc = (await response.json()) as MediaDoc
        return [String(id), doc] as const
      } catch {
        return null
      }
    }),
  )

  const byId = new Map<string, MediaDoc>()
  for (const entry of entries) {
    if (entry) byId.set(entry[0], entry[1])
  }
  applyMedia(clone.root, byId)
  return clone
}

/** Server-side: populate uploads via Local API before converting to email HTML. */
export async function populateLexicalUploadsServer(
  payload: Payload,
  data: DefaultTypedEditorState,
): Promise<DefaultTypedEditorState> {
  const clone = structuredClone(data) as DefaultTypedEditorState & { root: LexicalNode }
  const ids = collectUploadIds(clone.root)
  if (ids.length === 0) return clone

  const byId = new Map<string, MediaDoc>()
  await Promise.all(
    ids.map(async (id) => {
      try {
        const doc = (await payload.findByID({
          collection: 'media',
          id,
          depth: 0,
          overrideAccess: true,
        })) as MediaDoc
        byId.set(String(id), doc)
      } catch {
        // Missing media — leave node empty in HTML.
      }
    }),
  )
  applyMedia(clone.root, byId)
  return clone
}
