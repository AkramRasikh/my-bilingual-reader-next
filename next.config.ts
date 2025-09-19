import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-b5ca1708937148638ba66e658bf7d03c.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
