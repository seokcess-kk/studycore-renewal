/**
 * 카카오 알림톡 발송 유틸리티 (Solapi 경유)
 *
 * Solapi API를 통해 카카오 알림톡을 발송합니다.
 * 알림톡 실패 시 SMS fallback을 Solapi가 자동 처리합니다.
 *
 * 환경변수 (SMS와 공유):
 *   - SMS_API_KEY
 *   - SMS_API_SECRET
 *   - SMS_SENDER_PHONE
 *   - KAKAO_CHANNEL_ID (카카오 채널 pfId)
 */

interface SendAlimtalkOptions {
  to: string;
  templateCode: string;
  variables?: Record<string, string>;
  /** SMS fallback 메시지 (알림톡 실패 시 대체 발송) */
  fallbackMessage?: string;
}

interface AlimtalkResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// 전화번호 정규화
function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

// Solapi HMAC-SHA256 서명 생성
async function generateSignature(
  apiSecret: string,
  timestamp: string
): Promise<{ salt: string; signature: string }> {
  const salt = crypto.randomUUID();
  const message = timestamp + salt;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );

  const signature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return { salt, signature };
}

// Solapi API 인증 헤더 생성
async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const apiKey = Deno.env.get("SMS_API_KEY");
  const apiSecret = Deno.env.get("SMS_API_SECRET");

  if (!apiKey || !apiSecret) {
    console.error("SMS API 환경변수가 설정되지 않았습니다.");
    return null;
  }

  const timestamp = new Date().toISOString();
  const { salt, signature } = await generateSignature(apiSecret, timestamp);

  return {
    "Content-Type": "application/json",
    Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${timestamp}, salt=${salt}, signature=${signature}`,
  };
}

/**
 * 솔라피 경유 알림톡 발송 (SMS fallback 포함)
 *
 * 알림톡 발송 실패 시 fallbackMessage가 있으면 SMS로 자동 대체 발송됩니다.
 */
export async function sendAlimtalk(
  options: SendAlimtalkOptions
): Promise<AlimtalkResponse> {
  const senderPhone = Deno.env.get("SMS_SENDER_PHONE");
  const pfId = Deno.env.get("KAKAO_CHANNEL_ID");
  const headers = await getAuthHeaders();

  if (!headers || !senderPhone) {
    return {
      success: false,
      error: "SMS 설정이 완료되지 않았습니다.",
    };
  }

  if (!pfId) {
    return {
      success: false,
      error: "카카오 채널 ID(KAKAO_CHANNEL_ID)가 설정되지 않았습니다.",
    };
  }

  const normalizedTo = normalizePhone(options.to);
  const normalizedFrom = normalizePhone(senderPhone);

  // 1차: 알림톡 시도 (ATA = 알림톡 + SMS 자동 fallback)
  const alimtalkMessage = {
    to: normalizedTo,
    from: normalizedFrom,
    type: "ATA",
    text: options.fallbackMessage || "",
    kakaoOptions: {
      pfId,
      templateId: options.templateCode,
      variables: options.variables || {},
    },
  };

  try {
    const response = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers,
      body: JSON.stringify({ message: alimtalkMessage }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: data.messageId || data.groupId,
      };
    }

    // 알림톡 API 요청 자체가 실패 → 순수 SMS로 재시도
    console.error("알림톡 발송 실패, SMS로 재시도:", data);
  } catch (error) {
    console.error("알림톡 발송 에러, SMS로 재시도:", error);
  }

  // 2차: 순수 SMS (kakaoOptions 없이)
  if (options.fallbackMessage) {
    try {
      const smsMessage = {
        to: normalizedTo,
        from: normalizedFrom,
        text: options.fallbackMessage,
      };

      const smsResponse = await fetch("https://api.solapi.com/messages/v4/send", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: smsMessage }),
      });

      const smsData = await smsResponse.json();

      if (smsResponse.ok) {
        return {
          success: true,
          messageId: smsData.messageId || smsData.groupId,
        };
      }

      console.error("SMS fallback도 실패:", smsData);
      return {
        success: false,
        error: smsData.errorMessage || smsData.message || "SMS fallback 실패",
      };
    } catch (error) {
      console.error("SMS fallback 에러:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "SMS fallback 중 오류",
      };
    }
  }

  return {
    success: false,
    error: "알림톡 실패 + fallback 메시지 없음",
  };
}

/**
 * 대량 알림톡 발송
 */
export async function sendBulkAlimtalk(
  recipients: {
    phone: string;
    templateCode: string;
    variables?: Record<string, string>;
    fallbackMessage?: string;
  }[]
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const result = await sendAlimtalk({
      to: recipient.phone,
      templateCode: recipient.templateCode,
      variables: recipient.variables,
      fallbackMessage: recipient.fallbackMessage,
    });

    if (result.success) {
      success++;
    } else {
      failed++;
    }

    // 100ms 딜레이
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return { success, failed };
}

// 알림톡 템플릿 코드 상수
export const ALIMTALK_TEMPLATES = {
  CONSULT_ADMIN: "KA01TP260316134042128OzZqtpXC26e",
  QUESTION_MENTOR: "KA01TP260316132801952tAzK1ksEKVM",
  ANSWER_STUDENT: "KA01TP260316132947648ETw4ixNvIsv",
  NOTICE_STUDENT: "KA01TP260316141126363qntJo1doUdu",
} as const;
