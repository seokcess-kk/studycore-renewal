import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeRedirectPath, getPostAuthDestination } from "@/lib/auth-redirect";

/**
 * OAuth 콜백 Route Handler (서버 사이드)
 *
 * PKCE 플로우에서 code verifier가 쿠키에 저장되므로
 * 반드시 서버에서 exchangeCodeForSession을 호출해야 합니다.
 * 클라이언트 페이지에서 호출하면 PKCE 에러 발생.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next"), "/");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback error:", error.message);
    return NextResponse.redirect(`${origin}/login`);
  }

  // 프로필 확인 → 상태별 목적지 결정
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, status")
    .eq("id", user.id)
    .single();

  const destination = getPostAuthDestination(profile, next);
  return NextResponse.redirect(`${origin}${destination}`);
}
