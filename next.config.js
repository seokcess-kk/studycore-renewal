// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/**
 * Content-Security-Policy (Report-Only 단계)
 * - Phase 1: Report-Only로 위반 모니터링만 수행. 실제 차단은 하지 않음.
 * - Phase 2: report-uri/연결한 모니터링 도구로 위반 검토 후 'Content-Security-Policy'로 전환.
 *
 * 외부 도메인 화이트리스트
 * - Supabase Storage·Realtime: *.supabase.co / *.supabase.in
 * - Meta Pixel: connect.facebook.net (script), www.facebook.com (img/frame)
 * - Kakao Maps: dapi.kakao.com (script), t1.daumcdn.net (asset)
 * - Unsplash 데모 이미지: images.unsplash.com
 */
function buildContentSecurityPolicy() {
  const isDev = process.env.NODE_ENV !== "production";
  const directives = [
    "default-src 'self'",
    [
      "script-src",
      "'self'",
      "'unsafe-inline'",
      // dev: webpack/turbopack HMR이 eval 사용
      isDev ? "'unsafe-eval'" : "",
      "https://connect.facebook.net",
      "https://dapi.kakao.com",
      "https://t1.daumcdn.net",
    ]
      .filter(Boolean)
      .join(" "),
    "style-src 'self' 'unsafe-inline' https://t1.daumcdn.net",
    [
      "img-src",
      "'self'",
      "data:",
      "blob:",
      "https://*.supabase.co",
      "https://*.supabase.in",
      "https://images.unsplash.com",
      "https://www.facebook.com",
      "https://*.daumcdn.net",
      "https://t1.daumcdn.net",
    ].join(" "),
    "font-src 'self' data:",
    [
      "connect-src",
      "'self'",
      "https://*.supabase.co",
      "https://*.supabase.in",
      "wss://*.supabase.co",
      "https://www.facebook.com",
      "https://connect.facebook.net",
      "https://dapi.kakao.com",
    ].join(" "),
    "worker-src 'self' blob:",
    "frame-src 'self' https://www.facebook.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ];
  return directives.join("; ");
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: buildContentSecurityPolicy(),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack 설정 (개발 모드에서 webpack 경고 방지)
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
