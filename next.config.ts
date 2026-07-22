import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/email/newsletter-preview": [
      "./public/newsletters/daily-2026-07-21-preview-v1/*.png"
    ]
  }
};

export default nextConfig;
