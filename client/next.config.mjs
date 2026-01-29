/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      'framer-motion',
    ],
  },

  // Image optimization for modern formats
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Remove console.log in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
