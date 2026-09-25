import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_APP_URL!,
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_APP_URL!,
        pathname: "/uploads/**",
      },
    ],
    unoptimized: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackBuildWorker: false,
    webpackMemoryOptimizations: true,
    cpus: 1,
  },
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/rfp/buyer_preview/:id*",
        destination: "/rfq/buyer_preview/:id*",
        permanent: false,
      },
      {
        source: "/rfp/buyer-preview/:id*",
        destination: "/rfq/buyer-preview/:id*",
        permanent: false,
      },
      {
        source: "/rfp/:path*",
        destination: "/rfq/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/rfp/buyer_preview/:id*",
          destination: "/rfq/buyer-preview/:id*",
        },
        {
          source: "/rfp/buyer-preview/:id*",
          destination: "/rfq/buyer-preview/:id*",
        },
        {
          source: "/rfp/:path*",
          destination: "/rfq/:path*",
        },
        {
          source: "/rfq/buyer_preview/:id*",
          destination: "/rfq/buyer-preview/:id*",
        },
        {
          source: "/rfq/buyer-preview/:id*",
          destination: "/rfq/buyer-preview/:id*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
