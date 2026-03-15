/**
 * 상담 신청 알림 Edge Function
 *
 * 트리거: 상담 신청 폼 제출
 * 발송 대상:
 *   1. 관리자 (알림톡/SMS)
 *   2. 신청자 (접수 확인 SMS)
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
  grade?: number;
  message?: string;
}

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
      customerNotified: false,
      errors: [] as string[],
    };

    // 1. 관리자에게 알림 발송
    if (adminPhone) {
      const adminMessage = `[스터디코어] 상담 신청
이름: ${body.name}
연락처: ${body.phone}
${body.school ? `학교: ${body.school}` : ""}
${body.grade ? `학년: ${body.grade}학년` : ""}
${body.message ? `메시지: ${body.message}` : ""}`;

      // 알림톡 시도
      const alimtalkResult = await sendAlimtalk({
        to: adminPhone,
        templateCode: ALIMTALK_TEMPLATES.CONSULT_ADMIN,
        variables: {
          이름: body.name,
          연락처: body.phone,
          학교: body.school || "-",
          학년: body.grade?.toString() || "-",
          메시지: body.message || "-",
        },
      });

      if (alimtalkResult.success) {
        results.adminNotified = true;
        // 알림톡 성공 로그
        await logNotification({
          type: "alimtalk",
          recipient_phone: adminPhone,
          recipient_name: "관리자",
          message: adminMessage,
          template_code: ALIMTALK_TEMPLATES.CONSULT_ADMIN,
          status: "sent",
          metadata: { trigger: "consult", customerName: body.name },
        });
      } else {
        // SMS fallback
        const smsResult = await sendSMS({
          to: adminPhone,
          message: adminMessage,
        });

        if (smsResult.success) {
          results.adminNotified = true;
          // SMS 성공 로그
          await logNotification({
            type: "sms",
            recipient_phone: adminPhone,
            recipient_name: "관리자",
            message: adminMessage,
            status: "sent",
            metadata: { trigger: "consult", customerName: body.name, fallback: true },
          });
        } else {
          results.errors.push(
            `관리자 알림 실패: ${smsResult.error || "알 수 없는 오류"}`
          );
          // 실패 로그
          await logNotification({
            type: "sms",
            recipient_phone: adminPhone,
            recipient_name: "관리자",
            message: adminMessage,
            status: "failed",
            error_message: smsResult.error || "알 수 없는 오류",
            metadata: { trigger: "consult", customerName: body.name },
          });
        }
      }
    }

    // 2. 신청자에게 접수 확인 SMS
    const customerMessage = `[스터디코어] ${body.name}님, 상담 신청이 접수되었습니다. 영업일 기준 1-2일 내에 연락드리겠습니다.`;

    const customerResult = await sendSMS({
      to: body.phone,
      message: customerMessage,
    });

    if (customerResult.success) {
      results.customerNotified = true;
      // 고객 SMS 성공 로그
      await logNotification({
        type: "sms",
        recipient_phone: body.phone,
        recipient_name: body.name,
        message: customerMessage,
        status: "sent",
        metadata: { trigger: "consult", type: "confirmation" },
      });
    } else {
      results.errors.push(
        `고객 알림 실패: ${customerResult.error || "알 수 없는 오류"}`
      );
      // 고객 SMS 실패 로그
      await logNotification({
        type: "sms",
        recipient_phone: body.phone,
        recipient_name: body.name,
        message: customerMessage,
        status: "failed",
        error_message: customerResult.error || "알 수 없는 오류",
        metadata: { trigger: "consult", type: "confirmation" },
      });
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
