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
  reactStrictMode: false,
  async rewrites() {
    return {
      // `beforeFiles` runs ahead of the static-file check on purpose.
      //
      // Next snapshots the contents of public/ once at server startup, so a
      // file uploaded into public/uploads afterwards is invisible to the static
      // handler and 404s until the process restarts. Routing every /uploads
      // request to a handler that reads from disk makes newly uploaded files
      // available immediately, and keeps behaviour uniform rather than
      // depending on whether a file predates the current boot.
      beforeFiles: [
        {
          source: "/uploads/:path*",
          destination: "/api/uploads/:path*",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
