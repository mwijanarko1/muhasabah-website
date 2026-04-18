/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";
const firebaseAuthDomain =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "muhasabah-c2776.firebaseapp.com";

const connectSrcProduction = [
  "'self'",
  "https://firebase.googleapis.com",
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://firebaseinstallations.googleapis.com",
  "https://www.googleapis.com",
]
  .filter(Boolean)
  .join(" ");

const frameSrcProduction = [
  "'self'",
  `https://${firebaseAuthDomain}`,
  "https://accounts.google.com",
]
  .filter(Boolean)
  .join(" ");

export function buildProductionCsp() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://apis.google.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    `connect-src ${connectSrcProduction}`,
    `frame-src ${frameSrcProduction}`,
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
}

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    const baseline = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
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
    // and network access for Firebase Auth / Analytics.
    const csp = buildProductionCsp();

    return [
      {
        source: "/:path*",
        headers: [...baseline, { key: "Content-Security-Policy", value: csp }],
      },
    ];
  },
};

export default nextConfig;
