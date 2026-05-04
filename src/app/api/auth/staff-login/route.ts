import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { staffLoginSchema } from "@/domains/user/model";
import { STAFF_AUTH_FIXED_PASSWORD } from "@/lib/staff-auth-config";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/staff-login
 *
 * 서버 사이드 Staff 로그인:
 * 1. authenticate_staff RPC로 비밀번호 검증 (staff_credentials)
 * 2. 고정 비밀번호로 signInWithPassword (Supabase Auth 세션 생성)
 * 3. 세션 쿠키가 응답에 자동 포함됨
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 요청 파싱 + 유효성 검사
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "잘못된 요청 형식입니다." },
        { status: 400 }
      );
    }

    const validation = staffLoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

    // 2. 통합 인증 RPC (잠금 확인 + 비밀번호 검증 + 역할 확인 + 시도 기록)
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.rpc(
      "authenticate_staff",
      { p_username: username, p_password: password }
    );

    if (authError) {
      logger.error("authenticate_staff RPC 오류", {
        context: "staff-login",
        data: authError,
      });
      return NextResponse.json(
        { error: "인증 서비스에 연결할 수 없습니다." },
        { status: 500 }
      );
    }

    const result = authData as {
      success: boolean;
      error?: string;
      unlock_at?: string;
      profile?: Record<string, unknown>;
      must_change_password?: boolean;
    };

    if (!result.success) {
      if (result.error === "ACCOUNT_LOCKED") {
        const unlockTime = result.unlock_at
          ? new Date(result.unlock_at).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "잠시 후";
        return NextResponse.json(
          {
            error: `로그인 시도 횟수를 초과했습니다. ${unlockTime}에 다시 시도해주세요.`,
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }

    // 3. Supabase Auth 세션 생성 (고정 비밀번호 — 서버에서만 사용)
    const dummyEmail = `${username}@studycore.internal`;
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: STAFF_AUTH_FIXED_PASSWORD,
      });

    if (signInError || !signInData.user) {
      logger.error("Auth 세션 생성 실패", {
        context: "staff-login",
        data: signInError,
      });
      return NextResponse.json(
        { error: "세션 생성에 실패했습니다. 관리자에게 문의해주세요." },
        { status: 500 }
      );
    }

    // 4. 성공 응답 (세션 쿠키는 Supabase SSR이 자동 설정)
    return NextResponse.json({
      success: true,
      user: {
        id: signInData.user.id,
        email: signInData.user.email || "",
      },
      profile: result.profile,
      must_change_password: result.must_change_password === true,
    });
  } catch (error) {
    logger.exception(error, "staff-login");
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
