/**
 * Production boot without a shell: additive schema ensure, then Next standalone.
 * Secrets come from Compose/CI env — never baked into the image.
 */
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'

const node = process.execPath

if (existsSync('/app/scripts/ensure-schema.mjs')) {
  const result = spawnSync(node, ['/app/scripts/ensure-schema.mjs'], { stdio: 'inherit' })
  const code = result.status ?? 1
  if (code !== 0) {
    if (process.env.ENSURE_SCHEMA_STRICT === '1') {
      process.exit(code)
    }
    console.error(
      'ensure-schema: non-fatal failure (set ENSURE_SCHEMA_STRICT=1 to fail boot)',
    )
  }
}

const child = spawn(node, ['/app/server.js'], { stdio: 'inherit' })
child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})
