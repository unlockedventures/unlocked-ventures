import { ValidationError, type CollectionBeforeValidateHook } from 'payload'

import type { PodcastEpisode } from '@/payload-types'

/** Validate editor saves without blocking background patches of legacy episodes. */
export const validateEpisodeThumbnail: CollectionBeforeValidateHook<PodcastEpisode> = ({
  data,
  originalDoc,
  operation,
}) => {
  if (!data) return data
  const thumbnailSubmitted = ['imageSource', 'image', 'imageUrl', 'episodeStatus'].some((key) =>
    Object.prototype.hasOwnProperty.call(data, key),
  )
  if (operation === 'update' && !thumbnailSubmitted) return data

  const effective = { ...originalDoc, ...data }
  const source = effective.imageSource || 'upload'
  let path: 'image' | 'imageUrl' = 'image'
  let message = 'Upload an episode thumbnail image before saving.'
  let valid = false

  if (source === 'url') {
    path = 'imageUrl'
    message = 'Enter a valid http:// or https:// thumbnail image URL before saving.'
    const value = typeof effective.imageUrl === 'string' ? effective.imageUrl.trim() : ''
    try {
      const url = new URL(value)
      valid = (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname)
    } catch {
      valid = false
    }
    if (valid) data.imageUrl = value
  } else {
    const image = effective.image
    const id = image && typeof image === 'object' ? image.id : image
    valid = typeof id === 'number' && Number.isInteger(id) && id > 0
  }

  if (!valid) {
    throw new ValidationError({
      collection: 'podcast-episodes',
      errors: [{ path, message }],
    })
  }
  return data
}
