import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Output configuration
  outputFileTracingRoot: 'c:\\Users\\lucar\\Projects\\BIM\\BIMatch',

  // Production optimizations
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'], // Modern formats for better compression
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840], // Common breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon sizes
    minimumCacheTTL: 60 * 60 * 24 * 365, // Cache images for 1 year
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      }
    ],
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore'],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/_next/static/css/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css',
          },
        ],
      },
      {
        source: '/_next/static/js/(.*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          // Temporarily disabled CSP for debugging
          // {
          //   key: 'Content-Security-Policy',
          //   value: [
          //     "default-src 'self'",
          //     "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.firebaseapp.com https://*.gstatic.com https://apis.google.com",
          //     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          //     "font-src 'self' https://fonts.gstatic.com",
          //     "img-src 'self' data: https: blob: https://images.unsplash.com https://firebasestorage.googleapis.com",
          //     "connect-src 'self' https://*.googleapis.com https://*.firebaseapp.com https://*.firebaseio.com wss://*.firebaseio.com",
          //     "frame-src 'self' https://*.firebaseapp.com https://*.googleapis.com",
          //     "media-src 'self'",
          //     "object-src 'none'",
          //     "base-uri 'self'",
          //     "form-action 'self'",
          //     "frame-ancestors 'none'",
          //     "upgrade-insecure-requests",
          //     "block-all-mixed-content"
          //   ].join('; '),
          // },
          {
            key: 'Permissions-Policy',
            value: [
              'camera=()',
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()'
            ].join(', '),
          }
        ],
      },
    ];
  },
};

export default nextConfig;