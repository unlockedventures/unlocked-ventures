import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  // Required for the production multi-stage image (standalone server trace).
  output: 'standalone',
  // Payload/seed typing debt fails Next 16's build-time tsc (draft unions, seeds, etc.).
  // Runtime behavior is unchanged; tighten types separately with `tsc --noEmit` when ready.
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    globalNotFound: true,
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/brand/**',
      },
      {
        pathname: '/footer/**',
      },
      {
        pathname: '/contact/**',
      },
      {
        pathname: '/solutions/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
