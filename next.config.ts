import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.zelvira.co.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.zelvira.my.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.zelvira.co.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.zelvira.my.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'zelvira.my.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.zelvira.co.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.zelvira.my.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.zelvira.co.id',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'store.zelvira.my.id',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-icons',
      'date-fns',
      'recharts',
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
