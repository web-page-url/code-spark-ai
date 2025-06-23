/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    SITE_URL: process.env.SITE_URL,
    SITE_NAME: process.env.SITE_NAME,
  },
  // Remove the experimental serverActions setting as it's now enabled by default
  experimental: {
    // Remove optimizeCss as it can cause webpack conflicts
    // optimizeCss: true, 
    optimizeServerReact: true,
    serverComponentsExternalPackages: [],
    scrollRestoration: true,
  },
  
  // Compression and caching
  compress: true,
  poweredByHeader: false,
  
  // SEO optimizations
  trailingSlash: false,
  generateEtags: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ],
      },
      {
        source: '/docs',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400'
          }
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800'
          }
        ],
      }
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/documentation',
        destination: '/docs',
        permanent: true,
      },
      {
        source: '/guide',
        destination: '/docs',
        permanent: true,
      },
      {
        source: '/help',
        destination: '/docs',
        permanent: true,
      }
    ];
  },

  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };

    // Tree shaking - Remove usedExports to avoid conflict with Next.js optimization
    // config.optimization.usedExports = true; // Causes conflict with Next.js 14+
    config.optimization.sideEffects = false;

    return config;
  },

  // Bundle analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    experimental: {
      bundleAnalyzer: {
        enabled: true,
      },
    },
  }),
};

module.exports = nextConfig; 