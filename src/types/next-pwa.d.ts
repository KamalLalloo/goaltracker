declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PWAConfig = {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    fallbacks?: {
      document?: string;
    };
    runtimeCaching?: unknown[];
    buildExcludes?: RegExp[];
  };

  export default function withPWA(
    config: PWAConfig,
  ): (nextConfig: NextConfig) => NextConfig;
}
