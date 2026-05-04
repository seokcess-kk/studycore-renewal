// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/**
 * Content-Security-Policy (Phase 2 — 정식 차단)
 * - Phase 1: Report-Only로 위반 모니터링만 수행 (모니터링 완료)
 * - Phase 2: 정식 'Content-Security-Policy' 헤더로 실제 차단 적용 ✓ 현재 단계
 *
 * 외부 도메인 화이트리스트
 * - Supabase Storage·Realtime: *.supabase.co / *.supabase.in
 * - Meta Pixel: connect.facebook.net (script), www.facebook.com (img/frame)
 * - Kakao Maps: dapi.kakao.com (script), t1.daumcdn.net (asset)
 * - Unsplash 데모 이미지: images.unsplash.com
 *
 * 위반 발견 시 buildContentSecurityPolicy()의 해당 directive에 도메인 추가.
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
    key: "Content-Security-Policy",
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
