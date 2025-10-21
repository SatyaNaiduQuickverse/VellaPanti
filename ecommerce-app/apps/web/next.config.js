/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable SWC compiler (faster than Babel on ARM64)
  swcMinify: true,
  
  // ARM64 specific optimizations
  experimental: {
    // Optimize server components
    serverComponentsExternalPackages: ['@prisma/client', 'bcrypt'],
    // Enable turbopack for dev (if available)
    turbo: {
      resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json']
    }
  },

  // Optimize webpack for ARM64
  webpack: (config, { dev, isServer }) => {
    // ARM64 optimization for native modules
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('@prisma/client', 'bcrypt');
    }

    // Optimize for development speed
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename]
        }
      };
      
      // Faster source maps for development
      config.devtool = 'eval-cheap-module-source-map';
    }

    // Memory optimization
    config.optimization = {
      ...config.optimization,
      // Reduce memory usage during build
      splitChunks: dev ? false : config.optimization.splitChunks
    };

    return config;
  },

  transpilePackages: ['@ecommerce/ui', '@ecommerce/types'],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
    ],
    // Optimize image loading
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3062',
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3062'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
