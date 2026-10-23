import { APIError, type GlobalBeforeValidateHook } from 'payload'

import { reconcileHomePresentation, type HomeGroupPresentation } from '@/lib/home-menu-source'

type HomeMenuData = {
  menuSource?: string | null
  groups?: HomeGroupPresentation[] | null
  menuPresentationArchive?: HomeGroupPresentation[] | null
}

/** Preserve legacy menu data; only Header menu controls inherited labels and links. */
export const protectHomeMenuSource: GlobalBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!data) return data
  const incoming = data as HomeMenuData
  const previous = (originalDoc ?? {}) as HomeMenuData
  const source = incoming.menuSource === undefined ? previous.menuSource : incoming.menuSource
  const navigation = source
    ? await req.payload.findGlobal({ slug: 'navigation', depth: 0, overrideAccess: true, req })
    : null
  const parent = navigation?.items?.find((item) => item.id === source)
  if (source && !parent && source !== previous.menuSource) {
    throw new APIError('Select an available Header menu parent.', 400)
  }

  for (const rows of [incoming.groups, incoming.menuPresentationArchive]) {
    if (
      rows != null &&
      (!Array.isArray(rows) || rows.some((row) => !row || typeof row !== 'object'))
    ) {
      throw new APIError('Presentation must contain valid group rows.', 400)
    }
  }

  const previousRows = [...(previous.groups ?? []), ...(previous.menuPresentationArchive ?? [])]
  const protect = (row: HomeGroupPresentation) => {
    const old = previousRows.find((candidate) => candidate.id && candidate.id === row.id)
    return {
      ...row,
      title: old?.title ?? (req.user ? '' : row.title),
      items: old?.items ?? (req.user ? [] : row.items),
    }
  }
  const rows = (incoming.groups ?? previous.groups ?? []).map(protect)
  if (parent) {
    const archive = Array.isArray(incoming.menuPresentationArchive)
      ? incoming.menuPresentationArchive.map(protect)
      : (previous.menuPresentationArchive ?? [])
    // Partial API updates and source switches must not discard older presentation.
    for (const old of previousRows) {
      if (old.id && ![...rows, ...archive].some((row) => row.id === old.id)) archive.push(old)
    }
    Object.assign(incoming, reconcileHomePresentation(parent.groups ?? [], rows, archive))
  } else if (incoming.groups) {
    incoming.groups = rows
  }
  return data
}
