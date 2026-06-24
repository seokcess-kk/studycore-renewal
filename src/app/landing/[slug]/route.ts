import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLandingForServe } from "@/domains/landing/service";

/**
 * 광고 랜딩페이지 동적 서빙
 *
 * 어드민에 등록된 HTML을 원본 그대로 text/html로 응답한다.
 * 서빙 시 window.__LP_DATA__(landingPageId=slug)를 주입해, 랜딩 폼이
 * 자기 slug를 consultations.source로 전송하도록 한다.
 *
 * - 활성(is_active=true) slug만 서빙 (RLS landing_public_read)
 * - 없거나 비활성이면 404
 * - 인라인 CSS/JS/onclick/base64는 CSP(script-src/style-src 'unsafe-inline',
 *   img-src data:)가 이미 허용하므로 그대로 작동
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const supabase = await createClient();
  const landing = await getLandingForServe(supabase, slug);

  if (!landing) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // slug를 source로 연결: 현재 랜딩 JS가 `window.__LP_DATA__ || 기본값`을 참조
  const inject = `<script>window.__LP_DATA__={clinicId:'studycore_1_0',landingPageId:${JSON.stringify(
    slug
  )}};</script>`;
  const html = landing.html_content.includes("</head>")
    ? landing.html_content.replace("</head>", `${inject}</head>`)
    : `${inject}${landing.html_content}`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
