import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { hasAdminAccess } from "@/lib/constants";
import { STAFF_AUTH_FIXED_PASSWORD } from "@/lib/staff-auth-config";
import { checkRateLimit, STAFF_CREATE_RATE_LIMIT } from "@/lib/rate-limit";

/** RLS를 우회하는 Service Role 클라이언트 (이 라우트 전용) */
function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * 일회성 초기 비밀번호 생성 (12자, Web Crypto 난수)
 * 0/O/1/l 등 혼동 문자는 제거. Edge/Node 런타임 모두 호환.
 */
function generateInitialPassword(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const length = 12;
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += alphabet[buf[i] % alphabet.length];
  }
  return out;
}

export async function POST(request: NextRequest) {
  try {
    // 0. Rate Limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const rateLimitResult = checkRateLimit(
      `create-staff:${ip}`,
      STAFF_CREATE_RATE_LIMIT
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "너무 많은 요청입니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }

    // 1. 요청자 권한 확인
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!requesterProfile || !hasAdminAccess(requesterProfile.role)) {
      return NextResponse.json(
        { error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    // 2. 요청 데이터 파싱
    let body: { name?: string; username?: string; role?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
    }

    const { name, username, role } = body;

    if (!name || !username || !role) {
      return NextResponse.json(
        { error: "이름, 아이디, 역할은 필수입니다." },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]{4,}$/.test(username)) {
      return NextResponse.json(
        { error: "아이디는 4자 이상, 영문 소문자/숫자/밑줄만 사용 가능합니다." },
        { status: 400 }
      );
    }

    if (!["assistant", "mentor", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "잘못된 역할입니다." },
        { status: 400 }
      );
    }

    // 3. username 중복 체크
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "이미 사용 중인 아이디입니다." },
        { status: 409 }
      );
    }

    const email = `${username}@studycore.internal`;

    // 4. Supabase Auth 사용자 생성 (Service Role — RLS 우회)
    //    Auth 비밀번호는 고정값 (세션 생성 전용). 실제 검증은 staff_credentials.
    const admin = getAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password: STAFF_AUTH_FIXED_PASSWORD,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      const msg = authError?.message?.includes("already registered")
        ? "이미 등록된 이메일입니다. 기존 Auth 계정을 삭제 후 다시 시도해주세요."
        : `Auth 계정 생성 실패: ${authError?.message || "알 수 없는 오류"}`;
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // 5. profiles 테이블 업데이트 (Service Role — RLS 우회)
    //    auth.users INSERT 트리거(handle_new_user)가 기본 row를 이미 생성하므로 UPDATE.
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        username,
        name,
        role,
        status: "active",
      })
      .eq("id", authData.user.id);

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: `프로필 생성 실패: ${profileError.message}` },
        { status: 500 }
      );
    }

    // 6. staff_credentials에 bcrypt 비밀번호 설정 (일회성 랜덤)
    const initialPassword = generateInitialPassword();
    const { error: credError } = await admin.rpc("set_staff_password", {
      p_user_id: authData.user.id,
      p_username: username,
      p_password: initialPassword,
    });

    if (credError) {
      console.error("staff_credentials 설정 실패:", credError);
    }

    return NextResponse.json({
      success: true,
      username,
      password: initialPassword,
    });
  } catch (error) {
    console.error("스태프 계정 생성 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
