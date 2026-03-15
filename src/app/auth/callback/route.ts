import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ROUTES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? ROUTES.NOTICES;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 로그인 성공 - 프로필 확인
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 프로필 존재 여부 확인
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // 프로필이 없으면 추가 정보 입력 페이지로
          return NextResponse.redirect(`${origin}/register`);
        }
      }

      // 프로필이 있으면 다음 페이지로
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 에러 발생 시 로그인 페이지로
  return NextResponse.redirect(`${origin}${ROUTES.LOGIN}?error=auth_failed`);
}
