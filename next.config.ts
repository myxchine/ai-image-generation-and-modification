import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-f4591d9d0f73460abf273f25ccccf080.r2.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname:
          "initial-images.b71de92d3494c6f532fb9ac81bad73fe.r2.cloudflarestorage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

//initial-images.b71de92d3494c6f532fb9ac81bad73fe.r2.cloudflarestorage.com
