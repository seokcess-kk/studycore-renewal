import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeRedirectPath, getPostAuthDestination } from "@/lib/auth-redirect";

/**
 * OAuth 콜백 Route Handler (서버 사이드)
 *
 * PKCE 플로우에서 code verifier가 쿠키에 저장되므로
 * 반드시 서버에서 exchangeCodeForSession을 호출해야 합니다.
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
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  // 프로필 조회
  let { data: profile } = await supabase
    .from("profiles")
    .select("id, role, status, phone")
    .eq("id", user.id)
    .maybeSingle();

  // 프로필 없음 → 직접 생성 (트리거 미발동 케이스 대응)
  if (!profile) {
    const userName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "미입력";

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

    if (insertError || !newProfile) {
      // 프로필 생성 실패 → 로그인 페이지로
      return NextResponse.redirect(`${origin}/login`);
    }

    profile = newProfile;
  }

  const destination = getPostAuthDestination(profile, next);
  return NextResponse.redirect(`${origin}${destination}`);
}
