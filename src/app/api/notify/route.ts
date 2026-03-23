import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // 4. Service Role Key로 Edge Function 직접 호출
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Supabase 환경변수가 설정되지 않았습니다.");
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
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error(`${functionName} 호출 실패:`, response.status, result);
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
