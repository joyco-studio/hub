import { createMDX } from 'fumadocs-mdx/next'
import { NextConfig } from 'next'
import { getExternalComponentRedirects } from './lib/external-registries'

const withMDX = createMDX()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'qfxa88yauvyse9vr.public.blob.vercel-storage.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
  },
  async redirects() {
    return getExternalComponentRedirects()
  },
  async rewrites() {
    return [
      // Serve .md versions of content pages (e.g., /components/chat.md -> /llm/components/chat)
      {
        source: '/components/:path*.md',
        destination: '/llm/components/:path*',
      },
      {
        source: '/toolbox/:path*.md',
        destination: '/llm/toolbox/:path*',
      },
      {
        source: '/logs/:path*.md',
        destination: '/llm/logs/:path*',
      },
    ]
  },
}

export default withMDX(nextConfig)
