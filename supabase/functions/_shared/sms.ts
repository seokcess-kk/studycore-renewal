/**
 * SMS 발송 유틸리티
 *
 * Solapi SMS API를 사용합니다.
 * 환경변수:
 *   - SMS_API_KEY
 *   - SMS_API_SECRET
 *   - SMS_SENDER_PHONE
 */

interface SendSMSOptions {
  to: string;
  message: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface BatchSMSResult {
  success: number;
  failed: number;
  errors: Array<{ phone: string; error: string }>;
}

// 전화번호 정규화 (010-1234-5678 → 01012345678)
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

// API 인증 헤더 생성
async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const apiKey = Deno.env.get("SMS_API_KEY");
  const apiSecret = Deno.env.get("SMS_API_SECRET");

  if (!apiKey || !apiSecret) {
    console.error("SMS API 환경변수가 설정되지 않았습니다.");
    return null;
  }

  const timestamp = Date.now().toString();
  const { salt, signature } = await generateSignature(apiSecret, timestamp);

  return {
    "Content-Type": "application/json",
    Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${timestamp}, salt=${salt}, signature=${signature}`,
  };
}

/**
 * 단일 SMS 발송
 */
export async function sendSMS(options: SendSMSOptions): Promise<SMSResponse> {
  const senderPhone = Deno.env.get("SMS_SENDER_PHONE");
  const headers = await getAuthHeaders();

  if (!headers || !senderPhone) {
    return {
      success: false,
      error: "SMS 설정이 완료되지 않았습니다.",
    };
  }

  const normalizedTo = normalizePhone(options.to);

  try {
    const response = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: {
          to: normalizedTo,
          from: normalizePhone(senderPhone),
          text: options.message,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("SMS 발송 실패:", errorData);
      return {
        success: false,
        error: errorData.message || "SMS 발송에 실패했습니다.",
      };
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (error) {
    console.error("SMS 발송 에러:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "SMS 발송 중 오류 발생",
    };
  }
}

/**
 * 대량 SMS 발송 (배치 API 사용)
 * Solapi는 최대 10,000건까지 한 번에 발송 가능
 */
export async function sendBulkSMS(
  recipients: { phone: string; message: string }[]
): Promise<BatchSMSResult> {
  const senderPhone = Deno.env.get("SMS_SENDER_PHONE");
  const headers = await getAuthHeaders();

  if (!headers || !senderPhone) {
    return {
      success: 0,
      failed: recipients.length,
      errors: recipients.map((r) => ({
        phone: r.phone,
        error: "SMS 설정이 완료되지 않았습니다.",
      })),
    };
  }

  const normalizedSender = normalizePhone(senderPhone);
  const BATCH_SIZE = 100; // 한 번에 100건씩 발송

  let totalSuccess = 0;
  let totalFailed = 0;
  const errors: Array<{ phone: string; error: string }> = [];

  // 배치로 분할
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    // 동일 메시지 그룹화 (메시지별로 to 배열 생성)
    const messageGroups = new Map<string, string[]>();
    for (const recipient of batch) {
      const phones = messageGroups.get(recipient.message) || [];
      phones.push(normalizePhone(recipient.phone));
      messageGroups.set(recipient.message, phones);
    }

    // 각 메시지 그룹별 발송
    for (const [message, phones] of messageGroups) {
      try {
        // Solapi 대량 발송 API (messages 배열)
        const messages = phones.map((phone) => ({
          to: phone,
          from: normalizedSender,
          text: message,
        }));

        const response = await fetch(
          "https://api.solapi.com/messages/v4/send-many",
          {
            method: "POST",
            headers,
            body: JSON.stringify({ messages }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("배치 발송 실패:", errorData);
          totalFailed += phones.length;
          phones.forEach((phone) =>
            errors.push({
              phone,
              error: errorData.message || "발송 실패",
            })
          );
          continue;
        }

        const data = await response.json();

        // 결과 분석
        if (data.groupInfo) {
          totalSuccess += data.groupInfo.count?.total || 0;
          // 실패 건수는 전체에서 성공 건수를 뺌
          const failedInBatch = phones.length - (data.groupInfo.count?.total || 0);
          totalFailed += failedInBatch;
        } else {
          // 응답 형식이 다른 경우 성공으로 간주
          totalSuccess += phones.length;
        }
      } catch (error) {
        console.error("배치 발송 에러:", error);
        totalFailed += phones.length;
        phones.forEach((phone) =>
          errors.push({
            phone,
            error: error instanceof Error ? error.message : "발송 중 오류",
          })
        );
      }

      // Rate limit 방지 (배치 간 200ms 대기)
      if (i + BATCH_SIZE < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }

  return {
    success: totalSuccess,
    failed: totalFailed,
    errors,
  };
}

/**
 * 동일 메시지 대량 발송 (최적화)
 * 모든 수신자에게 동일한 메시지를 보낼 때 사용
 */
export async function sendBulkSMSSameMessage(
  phones: string[],
  message: string
): Promise<BatchSMSResult> {
  const recipients = phones.map((phone) => ({ phone, message }));
  return sendBulkSMS(recipients);
}
