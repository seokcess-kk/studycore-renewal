/**
 * 질문 등록 알림 Edge Function
 *
 * 트리거: 학생이 질문 등록
 * 발송 대상: 모든 멘토
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendSMS } from "../_shared/sms.ts";
import { sendAlimtalk, ALIMTALK_TEMPLATES } from "../_shared/alimtalk.ts";
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

    // 메시지 생성 (SMS fallback용)
    const smsMessage = `[스터디코어 1.0] 새 질문이 등록되었습니다.

학생: ${body.studentName}
제목: ${body.title}

질문방에서 확인 후 답변해 주세요.`;

    // 멘토별 알림톡 발송 (SMS fallback 포함)
    const logEntries: NotificationLogEntry[] = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const mentor of mentors) {
      const phone = mentor.phone as string;

      // 알림톡 우선 시도 (SMS fallback 포함)
      const alimtalkResult = await sendAlimtalk({
        to: phone,
        templateCode: ALIMTALK_TEMPLATES.QUESTION_MENTOR,
        variables: {
          학생이름: body.studentName,
          제목: body.title,
          질문ID: body.questionId,
        },
        fallbackMessage: smsMessage,
      });

      if (alimtalkResult.success) {
        sentCount++;
        logEntries.push({
          type: "alimtalk" as const,
          recipient_phone: phone,
          recipient_name: mentor.name,
          message: smsMessage,
          template_code: ALIMTALK_TEMPLATES.QUESTION_MENTOR,
          status: "sent" as const,
          metadata: { trigger: "question", questionId: body.questionId, studentName: body.studentName },
        });
      } else {
        // 알림톡+fallback 실패 시 직접 SMS
        const smsResult = await sendSMS({ to: phone, message: smsMessage });

        if (smsResult.success) {
          sentCount++;
        } else {
          failedCount++;
        }

        logEntries.push({
          type: "sms" as const,
          recipient_phone: phone,
          recipient_name: mentor.name,
          message: smsMessage,
          status: smsResult.success ? ("sent" as const) : ("failed" as const),
          error_message: smsResult.success ? undefined : smsResult.error,
          metadata: { trigger: "question", questionId: body.questionId, studentName: body.studentName, fallback: true },
        });
      }

      // 100ms 딜레이 (rate limit)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // 배치 로그 저장
    await logNotificationsBatch(logEntries);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        totalMentors: mentors.length,
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
