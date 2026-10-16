/**
 * Run Lighthouse performance audits and write Core Web Vitals–style reports
 * into test-reports/<metric>/ plus a full run under test-reports/lighthouse-test/.
 *
 * Usage:
 *   pnpm test:web-vitals
 *   BASE_URL=https://unlocked-ventures.vercel.app pnpm test:web-vitals
 */
import { spawnSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const reportsRoot = path.join(root, 'test-reports')
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '')

const pages = [
  { id: 'home', path: '/' },
  { id: 'about', path: '/about' },
  { id: 'contact', path: '/contact' },
  { id: 'podcast', path: '/podcast' },
  { id: 'insights', path: '/insights' },
  { id: 'our-successes', path: '/our-successes' },
]

/** Map Lighthouse audit ids → report folder names already present in the repo. */
const metricFolders: Record<
  string,
  { folder: string; label: string; unit: 'ms' | 'score' | 'unitless' }
> = {
  'first-contentful-paint': { folder: 'first-contentful-paint', label: 'First Contentful Paint (FCP)', unit: 'ms' },
  'largest-contentful-paint': {
    folder: 'largest-contentful-paint',
    label: 'Largest Contentful Paint (LCP)',
    unit: 'ms',
  },
  'cumulative-layout-shift': {
    folder: 'cumulative-layout-shift',
    label: 'Cumulative Layout Shift (CLS)',
    unit: 'unitless',
  },
  'total-blocking-time': { folder: 'total-blocking-time', label: 'Total Blocking Time (TBT)', unit: 'ms' },
  'speed-index': { folder: 'speed-index', label: 'Speed Index (SI)', unit: 'ms' },
  'server-response-time': { folder: 'time-to-first-byte', label: 'Time to First Byte (TTFB)', unit: 'ms' },
  'interaction-to-next-paint': {
    folder: 'interaction-to-next-paint',
    label: 'Interaction to Next Paint (INP)',
    unit: 'ms',
  },
}

type LhAudit = {
  id?: string
  title?: string
  description?: string
  score: number | null
  numericValue?: number
  displayValue?: string
  scoreDisplayMode?: string
}

type PageResult = {
  id: string
  url: string
  fetchTime?: string
  performanceScore: number | null
  audits: Record<string, LhAudit | undefined>
  jsonPath: string
  htmlPath: string
}

function ensureDirs() {
  mkdirSync(path.join(reportsRoot, 'lighthouse-test'), { recursive: true })
  for (const meta of Object.values(metricFolders)) {
    mkdirSync(path.join(reportsRoot, meta.folder), { recursive: true })
  }
}

function chromePath() {
  return (
    process.env.CHROME_PATH ||
    ['/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) =>
      existsSync(p),
    ) ||
    undefined
  )
}

function runLighthouse(pageId: string, url: string): PageResult {
  const outDir = path.join(reportsRoot, 'lighthouse-test')
  const baseName = `${pageId}-${stamp}`
  const jsonPath = path.join(outDir, `${baseName}.report.json`)
  const htmlPath = path.join(outDir, `${baseName}.report.html`)

  // Clear prior output path collision (lighthouse appends .report.json itself when --output-path is base)
  const outputPath = path.join(outDir, baseName)

  const args = [
    'lighthouse',
    url,
    '--only-categories=performance',
    '--preset=desktop',
    '--quiet',
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage',
    '--output=json',
    '--output=html',
    `--output-path=${outputPath}`,
  ]

  const chrome = chromePath()
  if (chrome) args.push(`--chrome-path=${chrome}`)

  const result = spawnSync('npx', ['--yes', ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, npm_config_devdir: undefined },
    timeout: 180_000,
  })

  if (result.status !== 0) {
    throw new Error(
      `Lighthouse failed for ${url}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
    )
  }

  if (!existsSync(jsonPath)) {
    throw new Error(`Expected Lighthouse JSON missing: ${jsonPath}`)
  }

  const raw = JSON.parse(readFileSync(jsonPath, 'utf8')) as {
    fetchTime?: string
    categories?: { performance?: { score: number | null } }
    audits?: Record<string, LhAudit>
  }

  const audits = raw.audits ?? {}
  return {
    id: pageId,
    url,
    fetchTime: raw.fetchTime,
    performanceScore:
      raw.categories?.performance?.score == null ? null : Math.round(raw.categories.performance.score * 100),
    audits: {
      'first-contentful-paint': audits['first-contentful-paint'],
      'largest-contentful-paint': audits['largest-contentful-paint'],
      'cumulative-layout-shift': audits['cumulative-layout-shift'],
      'total-blocking-time': audits['total-blocking-time'],
      'speed-index': audits['speed-index'],
      'server-response-time': audits['server-response-time'],
      'interaction-to-next-paint': audits['interaction-to-next-paint'],
    },
    jsonPath,
    htmlPath,
  }
}

function formatValue(audit: LhAudit | undefined, unit: 'ms' | 'score' | 'unitless') {
  if (!audit) return { display: 'n/a', numeric: null as number | null }
  if (audit.displayValue) return { display: audit.displayValue, numeric: audit.numericValue ?? null }
  if (audit.numericValue == null) return { display: 'n/a', numeric: null }
  if (unit === 'ms') return { display: `${Math.round(audit.numericValue)} ms`, numeric: audit.numericValue }
  if (unit === 'unitless') return { display: audit.numericValue.toFixed(3), numeric: audit.numericValue }
  return { display: String(audit.numericValue), numeric: audit.numericValue }
}

function rating(score: number | null | undefined) {
  if (score == null) return 'n/a'
  if (score >= 0.9) return 'good'
  if (score >= 0.5) return 'needs-improvement'
  return 'poor'
}

function writeMetricReports(pagesResults: PageResult[]) {
  for (const [auditId, meta] of Object.entries(metricFolders)) {
    const folder = path.join(reportsRoot, meta.folder)
    const rows = pagesResults.map((page) => {
      const audit = page.audits[auditId]
      const value = formatValue(audit, meta.unit)
      return {
        page: page.id,
        url: page.url,
        display: value.display,
        numeric: value.numeric,
        score: audit?.score ?? null,
        rating: rating(audit?.score ?? null),
      }
    })

    const jsonOut = {
      metric: meta.label,
      auditId,
      generatedAt: new Date().toISOString(),
      baseUrl,
      formFactor: 'desktop',
      note:
        auditId === 'interaction-to-next-paint'
          ? 'INP is primarily a field metric. Lab Lighthouse may omit it; TBT is the closest lab proxy for interactivity.'
          : undefined,
      results: rows,
    }

    writeFileSync(path.join(folder, `${meta.folder}-${stamp}.json`), JSON.stringify(jsonOut, null, 2))

    const md = [
      `# ${meta.label}`,
      '',
      `- Generated: ${jsonOut.generatedAt}`,
      `- Base URL: ${baseUrl}`,
      `- Form factor: desktop (Lighthouse lab)`,
      jsonOut.note ? `- Note: ${jsonOut.note}` : null,
      '',
      '| Page | Value | Score | Rating |',
      '|---|---:|---:|---|',
      ...rows.map(
        (row) =>
          `| ${row.page} | ${row.display} | ${row.score == null ? 'n/a' : row.score.toFixed(2)} | ${row.rating} |`,
      ),
      '',
      '## Thresholds (Lighthouse score bands)',
      '',
      '- **good**: score ≥ 0.90',
      '- **needs-improvement**: 0.50 – 0.89',
      '- **poor**: < 0.50',
      '',
    ]
      .filter((line) => line !== null)
      .join('\n')

    writeFileSync(path.join(folder, `${meta.folder}-${stamp}.md`), md)
    writeFileSync(path.join(folder, 'latest.md'), md)
    writeFileSync(path.join(folder, 'latest.json'), JSON.stringify(jsonOut, null, 2))
  }
}

function writeSummary(pagesResults: PageResult[]) {
  const summaryPath = path.join(reportsRoot, 'SUMMARY.md')
  const lines = [
    '# Web Vitals / Lighthouse report summary',
    '',
    `- Generated: ${new Date().toISOString()}`,
    `- Base URL: \`${baseUrl}\``,
    `- Tool: Lighthouse (desktop preset, performance category)`,
    '',
    '## Performance scores',
    '',
    '| Page | Performance | HTML report |',
    '|---|---:|---|',
    ...pagesResults.map(
      (page) =>
        `| ${page.id} | ${page.performanceScore ?? 'n/a'} | [open](${path.relative(reportsRoot, page.htmlPath)}) |`,
    ),
    '',
    '## Core metrics by page',
    '',
  ]

  for (const page of pagesResults) {
    lines.push(`### ${page.id} (\`${page.url}\`)`, '')
    lines.push('| Metric | Value | Rating |', '|---|---:|---|')
    for (const [auditId, meta] of Object.entries(metricFolders)) {
      const audit = page.audits[auditId]
      const value = formatValue(audit, meta.unit)
      lines.push(`| ${meta.label} | ${value.display} | ${rating(audit?.score ?? null)} |`)
    }
    lines.push('')
  }

  lines.push(
    '## Report folders',
    '',
    '- `first-contentful-paint/` — FCP',
    '- `largest-contentful-paint/` — LCP',
    '- `cumulative-layout-shift/` — CLS',
    '- `total-blocking-time/` — TBT (lab interactivity proxy)',
    '- `speed-index/` — Speed Index',
    '- `time-to-first-byte/` — TTFB / server response time',
    '- `interaction-to-next-paint/` — INP when available',
    '- `lighthouse-test/` — full HTML + JSON Lighthouse runs',
    '',
  )

  writeFileSync(summaryPath, lines.join('\n'))
  writeFileSync(
    path.join(reportsRoot, 'lighthouse-test', `summary-${stamp}.json`),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseUrl,
        pages: pagesResults.map((page) => ({
          id: page.id,
          url: page.url,
          performanceScore: page.performanceScore,
          metrics: Object.fromEntries(
            Object.keys(metricFolders).map((auditId) => {
              const audit = page.audits[auditId]
              return [
                auditId,
                {
                  displayValue: audit?.displayValue ?? null,
                  numericValue: audit?.numericValue ?? null,
                  score: audit?.score ?? null,
                },
              ]
            }),
          ),
          htmlPath: path.relative(reportsRoot, page.htmlPath),
          jsonPath: path.relative(reportsRoot, page.jsonPath),
        })),
      },
      null,
      2,
    ),
  )
}

function main() {
  ensureDirs()
  console.log(`Running Lighthouse against ${baseUrl}`)

  const pagesResults: PageResult[] = []
  for (const page of pages) {
    const url = `${baseUrl}${page.path}`
    console.log(`→ ${page.id}: ${url}`)
    const result = runLighthouse(page.id, url)
    pagesResults.push(result)
    console.log(`  performance=${result.performanceScore ?? 'n/a'}`)
  }

  writeMetricReports(pagesResults)
  writeSummary(pagesResults)
  console.log(`Reports written under ${reportsRoot}`)
}

main()
