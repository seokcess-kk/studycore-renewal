/**
 * 알림톡/SMS 발송 Edge Function
 *
 * type=notice → 알림톡 템플릿(SC_NOTICE_STUDENT) + SMS fallback
 * type=custom → SMS 대량 발송
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendAlimtalk, ALIMTALK_TEMPLATES } from "../_shared/alimtalk.ts";
import { sendBulkSMSSameMessage } from "../_shared/sms.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { logNotificationsBatch, NotificationLogEntry } from "../_shared/notification-logger.ts";

interface Recipient {
  userId: string;
  name: string;
  phone: string;
  isParent?: boolean;
}

interface SendRequest {
  type: string;
  recipients: Recipient[];
  message: string;
  noticeTitle?: string;
  noticeUrl?: string;
  sentBy?: string;
}

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const body: SendRequest = await req.json();

    if (!body.recipients || body.recipients.length === 0) {
      return new Response(
        JSON.stringify({ error: "발송 대상이 없습니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!body.message || body.message.trim() === "") {
      return new Response(
        JSON.stringify({ error: "메시지를 입력해주세요." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedMessage = body.message.startsWith("[스터디코어]")
      ? body.message
      : `[스터디코어] ${body.message}`;

    let sentCount = 0;
    let failedCount = 0;
    const logEntries: NotificationLogEntry[] = [];

    // ─── notice 타입: 알림톡 템플릿 개별 발송 ───
    if (body.type === "notice" && body.noticeTitle) {
      for (const r of body.recipients) {
        const result = await sendAlimtalk({
          to: r.phone,
          templateCode: ALIMTALK_TEMPLATES.NOTICE_STUDENT,
          variables: {
            제목: body.noticeTitle,
            URL: body.noticeUrl || "https://www.studycore.kr/notices",
          },
          fallbackMessage: formattedMessage,
        });

        if (result.success) {
          sentCount++;
        } else {
          failedCount++;
        }

        logEntries.push({
          type: (result.sentVia || "alimtalk") as "sms" | "alimtalk",
          recipient_phone: r.phone,
          recipient_name: r.name,
          message: formattedMessage,
          template_code: ALIMTALK_TEMPLATES.NOTICE_STUDENT,
          status: result.success ? "sent" : "failed",
          error_message: result.success ? undefined : result.error,
          sent_by: body.sentBy,
          metadata: {
            trigger: "notice",
            sentVia: result.sentVia,
            alimtalkError: result.alimtalkError,
            userId: r.userId,
            isParent: r.isParent,
          },
        });

        // 100ms 딜레이 (rate limit)
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    // ─── custom 타입: SMS 대량 발송 ───
    else {
      const phones = body.recipients.map((r) => r.phone);
      const result = await sendBulkSMSSameMessage(phones, formattedMessage);

      sentCount = result.success;
      failedCount = result.failed;

      const failedPhones = new Set(
        result.errors.map((e) => e.phone?.replace(/[^0-9]/g, ""))
      );

      for (const r of body.recipients) {
        const normalizedPhone = r.phone.replace(/[^0-9]/g, "");
        const isFailed = failedPhones.has(normalizedPhone);
        const errorInfo = result.errors.find(
          (e) => e.phone?.replace(/[^0-9]/g, "") === normalizedPhone
        );

        logEntries.push({
          type: "sms",
          recipient_phone: r.phone,
          recipient_name: r.name,
          message: formattedMessage,
          status: isFailed ? "failed" : "sent",
          error_message: isFailed ? errorInfo?.error : undefined,
          sent_by: body.sentBy,
          metadata: {
            trigger: "manual",
            type: body.type || "custom",
            userId: r.userId,
            isParent: r.isParent,
          },
        });
      }
    }

    await logNotificationsBatch(logEntries);

    return new Response(
      JSON.stringify({
        success: true,
        sentCount,
        failedCount,
        totalRecipients: body.recipients.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-kakao-alimtalk error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "알 수 없는 오류",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
