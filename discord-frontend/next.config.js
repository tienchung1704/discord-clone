const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tối ưu compiler
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Tối ưu experimental features
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-avatar",
      "@radix-ui/react-scroll-area",
      "date-fns",
      "emoji-mart",
    ],
  },

  // Turbopack config (Next.js 16 default)
  turbopack: {
    resolveAlias: {
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
    ],
    // Cache images lâu hơn
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // Tối ưu headers
  poweredByHeader: false,

  async rewrites() {
    return [
      {
        source: "/api/tts",
        destination: "http://localhost:8000/tts",
      },
    ];
  },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(withNextIntl(nextConfig));