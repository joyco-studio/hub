import { createMDX } from 'fumadocs-mdx/next'
import { NextConfig } from 'next'

const withMDX = createMDX()

const nextConfig: NextConfig = {
  /* config options here */
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
      }
    ],
  },
  env: {
    NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
  },
}

export default withMDX(nextConfig)
