import { createMDX } from 'fumadocs-mdx/next';
import { NextConfig } from 'next';

const withMDX = createMDX();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
    ],
  },
};

export default withMDX(nextConfig);
