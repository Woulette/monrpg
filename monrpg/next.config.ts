import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@pixel-realms/game-core",
    "@pixel-realms/protocol",
  ],
};

export default nextConfig;
