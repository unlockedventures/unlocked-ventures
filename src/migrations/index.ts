import * as rbac from './20261022_120000_rbac'
import * as videoTranscription from './20261022_190000_video_transcription'
import * as migration_20261009_120000_ensure_additive_schema from './20261009_120000_ensure_additive_schema'

export const migrations = [
  {
    up: migration_20261009_120000_ensure_additive_schema.up,
    down: migration_20261009_120000_ensure_additive_schema.down,
    name: '20261009_120000_ensure_additive_schema',
  },
  { up: rbac.up, down: rbac.down, name: '20261022_120000_rbac' },
  {
    up: videoTranscription.up,
    down: videoTranscription.down,
    name: '20261022_190000_video_transcription',
  },
]
