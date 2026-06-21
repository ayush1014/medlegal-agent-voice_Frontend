import type { NextConfig } from "next";

// Proxy /api/* to the backend so the browser only ever talks to THIS origin.
// That makes auth cookies first-party — works in every browser (no third-party
// cookie blocking), and no CORS is needed. Override the target with BACKEND_ORIGIN
// in Vercel env if the backend URL changes.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "https://2-24-86-57.sslip.io";

// Security headers applied to every route. Camera/mic stay disabled here at the
// app level; the voice-intake surface will opt-in explicitly where needed.
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Same-origin API: vercel.app/api/* → backend/api/* (server-side proxy).
      { source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
