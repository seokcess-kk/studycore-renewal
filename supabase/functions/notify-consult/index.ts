/**
 * 상담 신청 알림 Edge Function
 *
 * 트리거: 상담 신청 폼 제출
 * 발송 대상: 관리자 (알림톡 → SMS fallback)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendSMS } from "../_shared/sms.ts";
import { sendAlimtalk, ALIMTALK_TEMPLATES } from "../_shared/alimtalk.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { logNotification } from "../_shared/notification-logger.ts";

interface ConsultNotifyRequest {
  name: string;
  phone: string;
  school?: string;
  consultType?: string;
  message?: string;
}

const CONSULT_TYPE_LABELS: Record<string, string> = {
  admission: "입소 상담",
  tour: "시설 견학",
  program: "프로그램 문의",
  etc: "기타",
};

serve(async (req: Request) => {
  // CORS 처리
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: ConsultNotifyRequest = await req.json();

    // 필수 필드 검증
    if (!body.name || !body.phone) {
      return new Response(
        JSON.stringify({ error: "이름과 연락처는 필수입니다." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const adminPhone = Deno.env.get("ADMIN_PHONE");
    const results = {
      adminNotified: false,
      errors: [] as string[],
    };

    // 1. 관리자에게 알림 발송 (알림톡 우선 → SMS fallback)
    if (adminPhone) {
      const consultTypeLabel = CONSULT_TYPE_LABELS[body.consultType || ""] || body.consultType || "-";
      const adminMessage = `[스터디코어 1.0] 새 상담 신청이 접수되었습니다.

이름: ${body.name}
연락처: ${body.phone}
학교/학년: ${body.school || "-"}
유형: ${consultTypeLabel}
문의: ${body.message || "-"}

관리자 페이지에서 확인해 주세요.`;

      // 알림톡 시도 (실패 시 내부에서 SMS fallback)
      const result = await sendAlimtalk({
        to: adminPhone,
        templateCode: ALIMTALK_TEMPLATES.CONSULT_ADMIN,
        variables: {
          이름: body.name,
          연락처: body.phone,
          학교학년: body.school || "-",
          유형: consultTypeLabel,
          메시지: body.message || "-",
        },
        fallbackMessage: adminMessage,
      });

      results.adminNotified = result.success;

      // 발송 로그 기록
      await logNotification({
        type: result.sentVia || "alimtalk",
        recipient_phone: adminPhone,
        recipient_name: "관리자",
        message: adminMessage,
        template_code: ALIMTALK_TEMPLATES.CONSULT_ADMIN,
        status: result.success ? "sent" : "failed",
        error_message: result.success ? undefined : result.error,
        metadata: {
          trigger: "consult",
          customerName: body.name,
          sentVia: result.sentVia,
          alimtalkError: result.alimtalkError || undefined,
        },
      });

      if (!result.success) {
        results.errors.push(`관리자 알림 실패: ${result.error || "알 수 없는 오류"}`);
      }
    }

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("notify-consult error:", error);
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
