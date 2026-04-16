/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
let convexConnectExtra = "";
if (convexUrl) {
  try {
    const host = new URL(convexUrl).host;
    convexConnectExtra = ` https://${host} wss://${host}`;
  } catch {
    // invalid URL: rely on *.convex.cloud wildcards below
  }
}

const connectSrcProduction = [
  "'self'",
  convexConnectExtra.trim(),
  "https://*.convex.cloud",
  "wss://*.convex.cloud",
]
  .filter(Boolean)
  .join(" ");

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const baseline = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];

    // Production-only HSTS (avoid sending on http://localhost).
    if (!isDev) {
      baseline.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    // Do not send CSP in development: strict script-src/font-src breaks Next.js
    // Turbopack/HMR (inline bootstrap, self.__next_r) and is hostile to local dev tooling.
    if (isDev) {
      return [{ source: "/:path*", headers: baseline }];
    }

    // Production: allow Next.js inline scripts (framework requirement in many setups)
    // and network access for Convex (https / wss).
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https:",
      `connect-src ${connectSrcProduction}`,
      "object-src 'none'",
      "base-uri 'none'",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [...baseline, { key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;
