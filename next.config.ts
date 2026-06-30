import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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

export default withNextIntl(nextConfig);
