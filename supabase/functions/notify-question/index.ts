/**
 * 질문 등록 알림 Edge Function
 *
 * 트리거: 학생이 질문 등록
 * 발송 대상: 모든 멘토
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendBulkSMSSameMessage } from "../_shared/sms.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { logNotificationsBatch, NotificationLogEntry } from "../_shared/notification-logger.ts";

interface QuestionNotifyRequest {
  questionId: string;
  studentName: string;
  title: string;
}

serve(async (req: Request) => {
  // CORS 처리
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: QuestionNotifyRequest = await req.json();

    // 필수 필드 검증
    if (!body.questionId || !body.studentName || !body.title) {
      return new Response(
        JSON.stringify({ error: "필수 정보가 누락되었습니다." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 멘토 목록 조회
    const { data: mentors, error: mentorError } = await supabase
      .from("profiles")
      .select("id, name, phone")
      .in("role", ["mentor", "admin"])
      .not("phone", "is", null);

    if (mentorError) {
      throw new Error(`멘토 조회 실패: ${mentorError.message}`);
    }

    if (!mentors || mentors.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          sentCount: 0,
          message: "발송 대상 멘토가 없습니다.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 메시지 생성
    const message = `[스터디코어] 새 질문이 등록되었습니다.
학생: ${body.studentName}
제목: ${body.title}
질문방에서 확인해주세요.`;

    // 전화번호 목록 추출
    const phones = mentors.map((mentor) => mentor.phone as string);

    // 전화번호 → 이름 매핑
    const phoneToNameMap = new Map<string, string>();
    mentors.forEach((mentor) => {
      phoneToNameMap.set(mentor.phone as string, mentor.name);
    });

    // 배치 API로 대량 발송
    const result = await sendBulkSMSSameMessage(phones, message);

    // 발송 로그 생성 (배치)
    const failedPhones = new Set(
      result.errors.map((e) => e.phone?.replace(/[^0-9]/g, ""))
    );

    const logEntries: NotificationLogEntry[] = mentors.map((mentor) => {
      const phone = mentor.phone as string;
      const normalizedPhone = phone.replace(/[^0-9]/g, "");
      const isFailed = failedPhones.has(normalizedPhone);
      const errorInfo = result.errors.find(
        (e) => e.phone?.replace(/[^0-9]/g, "") === normalizedPhone
      );

      return {
        type: "sms" as const,
        recipient_phone: phone,
        recipient_name: mentor.name,
        message,
        status: isFailed ? ("failed" as const) : ("sent" as const),
        error_message: isFailed ? errorInfo?.error : undefined,
        metadata: {
          trigger: "question",
          questionId: body.questionId,
          studentName: body.studentName,
        },
      };
    });

    // 배치 로그 저장
    await logNotificationsBatch(logEntries);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount: result.success,
        failedCount: result.failed,
        totalMentors: mentors.length,
        errors: result.errors.length > 0 ? result.errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("notify-question error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
