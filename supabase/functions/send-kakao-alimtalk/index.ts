/**
 * 수동 알림톡 발송 Edge Function
 *
 * 트리거: /admin/kakao에서 수동 발송
 * 발송 대상: 선택된 수신자 목록
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendBulkSMSSameMessage } from "../_shared/sms.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { logNotificationsBatch, NotificationLogEntry } from "../_shared/notification-logger.ts";

interface Recipient {
  userId: string;
  name: string;
  phone: string;
  isParent?: boolean;
}

interface SendAlimtalkRequest {
  type: string;
  recipients: Recipient[];
  message: string;
  sentBy?: string; // 발송자 ID
}

serve(async (req: Request) => {
  // CORS 처리
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: SendAlimtalkRequest = await req.json();

    // 필수 필드 검증
    if (!body.recipients || body.recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "발송 대상이 없습니다." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!body.message || body.message.trim() === "") {
      return new Response(
        JSON.stringify({ error: "메시지를 입력해주세요." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 메시지 앞에 [스터디코어] 태그 추가
    const formattedMessage = body.message.startsWith("[스터디코어]")
      ? body.message
      : `[스터디코어] ${body.message}`;

    // 전화번호 목록 추출
    const phones = body.recipients.map((r) => r.phone);

    // 배치 API로 대량 발송 (동일 메시지)
    const result = await sendBulkSMSSameMessage(phones, formattedMessage);

    // 발송 로그 생성 (배치)
    const failedPhones = new Set(
      result.errors.map((e) => e.phone?.replace(/[^0-9]/g, ""))
    );

    const logEntries: NotificationLogEntry[] = body.recipients.map((r) => {
      const normalizedPhone = r.phone.replace(/[^0-9]/g, "");
      const isFailed = failedPhones.has(normalizedPhone);
      const errorInfo = result.errors.find(
        (e) => e.phone?.replace(/[^0-9]/g, "") === normalizedPhone
      );

      return {
        type: "sms" as const,
        recipient_phone: r.phone,
        recipient_name: r.name,
        message: formattedMessage,
        status: isFailed ? ("failed" as const) : ("sent" as const),
        error_message: isFailed ? errorInfo?.error : undefined,
        sent_by: body.sentBy,
        metadata: {
          trigger: "manual",
          type: body.type || "custom",
          userId: r.userId,
          isParent: r.isParent,
        },
      };
    });

    // 배치 로그 저장
    await logNotificationsBatch(logEntries);

    // 응답용 로그 (기존 호환성 유지)
    const logs = body.recipients.map((r, index) => {
      const normalizedPhone = r.phone.replace(/[^0-9]/g, "");
      const hasError = failedPhones.has(normalizedPhone);
      return {
        id: `log-${Date.now()}-${index}`,
        type: body.type || "custom",
        recipient_phone: r.phone,
        recipient_name: r.name,
        message: formattedMessage,
        status: hasError ? "failed" : "sent",
        sent_at: new Date().toISOString(),
        error: hasError
          ? result.errors.find(
              (e) => e.phone?.replace(/[^0-9]/g, "") === normalizedPhone
            )?.error
          : undefined,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        sentCount: result.success,
        failedCount: result.failed,
        totalRecipients: body.recipients.length,
        logs,
        errors: result.errors.length > 0 ? result.errors : undefined,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("send-kakao-alimtalk error:", error);
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
