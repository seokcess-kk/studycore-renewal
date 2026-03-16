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
      customerNotified: false,
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

      // 알림톡 시도 (SMS fallback 포함)
      const alimtalkResult = await sendAlimtalk({
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

      if (alimtalkResult.success) {
        results.adminNotified = true;
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
        // 알림톡+fallback 모두 실패 시 직접 SMS 시도
        const smsResult = await sendSMS({
          to: adminPhone,
          message: adminMessage,
        });

        results.adminNotified = smsResult.success;
        await logNotification({
          type: "sms",
          recipient_phone: adminPhone,
          recipient_name: "관리자",
          message: adminMessage,
          status: smsResult.success ? "sent" : "failed",
          error_message: smsResult.success ? undefined : smsResult.error,
          metadata: { trigger: "consult", customerName: body.name, fallback: true },
        });

        if (!smsResult.success) {
          results.errors.push(`관리자 알림 실패: ${smsResult.error || "알 수 없는 오류"}`);
        }
      }
    }

    // 2. 신청자에게 접수 확인 SMS
    const customerMessage = `안녕하세요. 스터디코어1.0입니다.

원활한 확인 및 기록 관리를 위해
전화·문자 문의는
카카오톡 채널 '스터디코어1.0'을 통해서만
안내드리고 있습니다.

※ 첫 번째 메시지 발송 시,
아래 정보를 반드시 함께 작성해 주세요.

[비재원생]
- 학생이름
- 연락처(본인)
- 연락처(학부모)
- 학교
- 학년(2026년 기준)
- 문의사항 (예: 3월 등록 안내)

[재원생]
- 학생이름 + 학생번호(휴대폰 뒤 4자리)
- 문의 및 요청사항
  (예: 월·수 수학학원 시간표 변경)

아래 채널로 메시지를 남겨주시면
확인 후 요청사항에 맞게 안내드리겠습니다.

▶ 카카오톡 채널 검색: 스터디코어1.0
http://pf.kakao.com/_execQn/chat`;

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
