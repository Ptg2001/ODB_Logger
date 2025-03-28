/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize for production builds
    if (!dev) {
      config.optimization.minimize = true;
    }
    
    // Add node modules that should be treated as external in client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        path: false,
        stream: false,
        timers: false,
      };
    }
    
    // Improve caching strategy for development with absolute path and unique names
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.resolve(process.cwd(), '.next/cache/webpack'),
        name: isServer ? 'server-development-' + Date.now() : 'client-development-' + Date.now(),
        version: '1.0.0', // Change this to invalidate cache
      };
    }
    
    return config;
  },
  // Enable Next.js runtime logging level
  onDemandEntries: {
    // Keep pages in memory for longer to avoid frequent recompilation
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
  env: {
    // Add environment variable to control SQL logging
    SUPPRESS_DB_LOGS: 'true',
  },
  // Extend ESLint config to ignore certain files
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable experimental features causing issues
  experimental: {
    // Disable optimizeCss as it requires critters
    optimizeCss: false,
  }
}

module.exports = nextConfig 