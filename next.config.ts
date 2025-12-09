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
}

export default withMDX(nextConfig)
