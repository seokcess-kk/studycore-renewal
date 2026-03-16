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

  // Solapi 메시지 구성
  const message: Record<string, unknown> = {
    to: normalizedTo,
    from: normalizedFrom,
    kakaoOptions: {
      pfId,
      templateId: options.templateCode,
      variables: options.variables || {},
    },
  };

  // SMS fallback 설정
  if (options.fallbackMessage) {
    message.text = options.fallbackMessage;
    message.type = "ATA"; // 알림톡 (Auto fallback to SMS)
  }

  try {
    const response = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers,
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("알림톡 발송 실패:", data);
      return {
        success: false,
        error: data.errorMessage || data.message || "알림톡 발송에 실패했습니다.",
      };
    }

    return {
      success: true,
      messageId: data.messageId || data.groupId,
    };
  } catch (error) {
    console.error("알림톡 발송 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "알림톡 발송 중 오류 발생",
    };
  }
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
  CONSULT_ADMIN: "SC_CONSULT_ADMIN",
  CONSULT_CUSTOMER: "SC_CONSULT_CUSTOMER",
  QUESTION_MENTOR: "SC_QUESTION_MENTOR",
  ANSWER_STUDENT: "SC_ANSWER_STUDENT",
  NOTICE_STUDENT: "SC_NOTICE_STUDENT",
  CUSTOM: "SC_CUSTOM",
} as const;
