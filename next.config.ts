import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:role(student|instructor)/live-session/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src https://zoom.us https://*.zoom.us;",
          },
        ],
      },
    ]
  },
};

export default nextConfig;
