import path from "path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  transpilePackages: ["@project/types"],
  webpack: (config) => {
    config.resolve.alias["@project/types"] = path.resolve(__dirname, "../../packages/types/src");
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
