import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/blog-gen-web",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
