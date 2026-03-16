/**
 * 답변 등록 알림 Edge Function
 *
 * 트리거: 멘토가 답변 등록
 * 발송 대상: 질문 작성자 (active 상태만)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendSMS } from "../_shared/sms.ts";
import { sendAlimtalk, ALIMTALK_TEMPLATES } from "../_shared/alimtalk.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { logNotification } from "../_shared/notification-logger.ts";

interface AnswerNotifyRequest {
  questionId: string;
  studentId: string;
  mentorName: string;
  questionTitle: string;
}

serve(async (req: Request) => {
  // CORS 처리
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: AnswerNotifyRequest = await req.json();

    // 필수 필드 검증
    if (!body.questionId || !body.studentId || !body.mentorName) {
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

    // 학생 정보 조회
    const { data: student, error: studentError } = await supabase
      .from("profiles")
      .select("id, name, phone, status")
      .eq("id", body.studentId)
      .single();

    if (studentError || !student) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "학생 정보를 찾을 수 없습니다.",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // active 상태가 아니면 알림 발송 안 함
    if (student.status !== "active") {
      return new Response(
        JSON.stringify({
          success: true,
          sent: false,
          reason: "비활성 상태 학생에게는 알림을 발송하지 않습니다.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 연락처가 없으면 발송 안 함
    if (!student.phone) {
      return new Response(
        JSON.stringify({
          success: true,
          sent: false,
          reason: "학생 연락처가 등록되지 않았습니다.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // SMS fallback 메시지
    const smsMessage = `[스터디코어 1.0] 질문에 답변이 등록되었습니다.

제목: ${body.questionTitle || "질문"}
답변: ${body.mentorName} 멘토

질문방에서 답변을 확인하세요.`;

    // 알림톡 우선 시도 (SMS fallback 포함)
    let sent = false;
    let usedType: "alimtalk" | "sms" = "sms";
    let errorMessage: string | undefined;

    const alimtalkResult = await sendAlimtalk({
      to: student.phone,
      templateCode: ALIMTALK_TEMPLATES.ANSWER_STUDENT,
      variables: {
        제목: body.questionTitle || "질문",
        멘토이름: body.mentorName,
        질문ID: body.questionId,
      },
      fallbackMessage: smsMessage,
    });

    if (alimtalkResult.success) {
      sent = true;
      usedType = "alimtalk";
    } else {
      // 알림톡+fallback 실패 시 직접 SMS
      const smsResult = await sendSMS({
        to: student.phone,
        message: smsMessage,
      });

      sent = smsResult.success;
      usedType = "sms";
      if (!smsResult.success) {
        errorMessage = smsResult.error || "알 수 없는 오류";
      }
    }

    // 로그 저장
    await logNotification({
      type: usedType,
      recipient_phone: student.phone,
      recipient_name: student.name,
      message: smsMessage,
      template_code: usedType === "alimtalk" ? ALIMTALK_TEMPLATES.ANSWER_STUDENT : undefined,
      status: sent ? "sent" : "failed",
      error_message: errorMessage,
      metadata: {
        trigger: "answer",
        questionId: body.questionId,
        mentorName: body.mentorName,
        fallback: usedType === "sms",
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        studentName: student.name,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("notify-answer error:", error);
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
