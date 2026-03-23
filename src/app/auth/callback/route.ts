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
    console.error("[auth/callback] code 없음");
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] 세션 교환 실패:", error.message);
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("[auth/callback] user 없음");
    return NextResponse.redirect(`${origin}/login`);
  }

  console.log("[auth/callback] user:", user.id, user.email);

  // 프로필 조회
  let { data: profile } = await supabase
    .from("profiles")
    .select("id, role, status, phone")
    .eq("id", user.id)
    .maybeSingle();

  console.log("[auth/callback] profile:", profile);

  // 프로필 없음 → 직접 생성 (트리거 미발동 케이스 대응)
  if (!profile) {
    const userName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "미입력";

    console.log("[auth/callback] 프로필 생성 시도:", userName);

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        name: userName,
        role: "student",
        status: "pending",
      })
      .select("id, role, status, phone")
      .maybeSingle();

    if (insertError) {
      console.error("[auth/callback] 프로필 생성 실패:", insertError.message);
    } else {
      profile = newProfile;
      console.log("[auth/callback] 프로필 생성 완료:", newProfile);
    }
  }

  const destination = getPostAuthDestination(profile, next);
  console.log("[auth/callback] 리다이렉트:", destination);
  return NextResponse.redirect(`${origin}${destination}`);
}
