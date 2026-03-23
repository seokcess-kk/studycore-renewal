import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * 알림 발송 API Route (서버사이드)
 *
 * 클라이언트에서 직접 Edge Function을 호출하면 anon key로 인증되어 실패합니다.
 * 이 Route Handler에서 Service Role Key로 Edge Function을 호출합니다.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 인증 확인 (로그인 사용자만)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 2. 요청 파싱
    const body = await request.json();
    const { type, ...data } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, error: "알림 타입이 필요합니다." },
        { status: 400 }
      );
    }

    // 3. Edge Function 매핑
    const functionMap: Record<string, string> = {
      question: "notify-question",
      answer: "notify-answer",
      notice: "send-kakao-alimtalk",
      custom: "send-kakao-alimtalk",
    };

    const functionName = functionMap[type];
    if (!functionName) {
      return NextResponse.json(
        { success: false, error: "지원하지 않는 알림 타입입니다." },
        { status: 400 }
      );
    }

    // 4. notice 타입: 수신자 목록 조회 후 Edge Function에 전달
    let edgeFunctionBody = data;

    if (type === "notice") {
      const adminClient = await createAdminClient();
      const query = adminClient
        .from("profiles")
        .select("id, name, phone, parent_phone")
        .eq("role", "student")
        .eq("status", "active")
        .not("phone", "is", null);

      const { data: students, error: queryError } = await query;

      if (queryError || !students || students.length === 0) {
        return NextResponse.json(
          { success: false, error: "발송 대상 재원생이 없습니다." },
          { status: 400 }
        );
      }

      const recipients: { userId: string; name: string; phone: string; isParent?: boolean }[] = [];

      for (const s of students) {
        if (s.phone) {
          recipients.push({ userId: s.id, name: s.name, phone: s.phone });
        }
        if (data.includeParents && s.parent_phone) {
          recipients.push({ userId: s.id, name: `${s.name} 학부모`, phone: s.parent_phone, isParent: true });
        }
      }

      const noticeUrl = `https://www.studycore.kr/notices/${data.noticeId}`;
      edgeFunctionBody = {
        type: "notice",
        recipients,
        message: `[스터디코어] 새 공지사항: ${data.noticeTitle}\n\n${noticeUrl}`,
      };
    }

    // 5. Service Role Key로 Edge Function 직접 호출
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: "서버 설정 오류" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/${functionName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify(edgeFunctionBody),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: result.error || "알림 발송 실패" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("알림 API 오류:", error);
    return NextResponse.json(
      { success: false, error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
