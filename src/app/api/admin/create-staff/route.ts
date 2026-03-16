import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { hasAdminAccess } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    // 1. 요청자 권한 확인
    const supabase = await createClient();
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
    const { name, username, role } = await request.json();

    if (!name || !username || !role) {
      return NextResponse.json(
        { error: "이름, 아이디, 역할은 필수입니다." },
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

    // 4. 임시 비밀번호 생성
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const email = `${username}@studycore.internal`;

    // 5. Supabase Auth 사용자 생성 (Service Role 필요)
    const adminClient = await createAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: `Auth 계정 생성 실패: ${authError?.message || "알 수 없는 오류"}` },
        { status: 500 }
      );
    }

    // 6. profiles 테이블에 프로필 생성
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: authData.user.id,
        username,
        name,
        role,
        status: "active",
      });

    if (profileError) {
      // 프로필 생성 실패 시 Auth 사용자도 삭제 (롤백)
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: `프로필 생성 실패: ${profileError.message}` },
        { status: 500 }
      );
    }

    // 7. staff_credentials에 bcrypt 비밀번호 설정
    const { error: credError } = await adminClient.rpc("set_staff_password", {
      p_user_id: authData.user.id,
      p_username: username,
      p_password: password,
    });

    if (credError) {
      // 치명적이지 않음 — 프로필은 생성됨, 비밀번호는 Auth 기본값 사용 가능
      console.error("staff_credentials 설정 실패:", credError);
    }

    return NextResponse.json({
      success: true,
      username,
      password,
    });
  } catch (error) {
    console.error("스태프 계정 생성 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
