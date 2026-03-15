/**
 * 카카오 알림톡 발송 유틸리티
 *
 * 카카오 비즈니스 채널 알림톡 API를 사용합니다.
 * 환경변수:
 *   - KAKAO_CHANNEL_ID
 *   - KAKAO_ALIMTALK_KEY
 */

interface SendAlimtalkOptions {
  to: string;
  templateCode: string;
  variables?: Record<string, string>;
}

interface AlimtalkResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// 전화번호 정규화 (010-1234-5678 → 01012345678)
function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "");
}

// 템플릿 변수 치환
function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`#{${key}}`, "g"), value);
  }
  return result;
}

export async function sendAlimtalk(
  options: SendAlimtalkOptions
): Promise<AlimtalkResponse> {
  const channelId = Deno.env.get("KAKAO_CHANNEL_ID");
  const apiKey = Deno.env.get("KAKAO_ALIMTALK_KEY");

  if (!channelId || !apiKey) {
    console.error("카카오 알림톡 환경변수가 설정되지 않았습니다.");
    return {
      success: false,
      error: "알림톡 설정이 완료되지 않았습니다.",
    };
  }

  const normalizedTo = normalizePhone(options.to);

  try {
    // 카카오 알림톡 API 호출
    // 실제 구현 시 카카오 비즈니스 채널 API 문서 참조
    const response = await fetch(
      "https://api.kakao.com/v2/api/talk/memo/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          channel_id: channelId,
          recipient: normalizedTo,
          template_code: options.templateCode,
          template_object: options.variables || {},
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("알림톡 발송 실패:", errorData);
      return {
        success: false,
        error: errorData.message || "알림톡 발송에 실패했습니다.",
      };
    }

    const data = await response.json();

    return {
      success: true,
      messageId: data.result_code,
    };
  } catch (error) {
    console.error("알림톡 발송 에러:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "알림톡 발송 중 오류 발생",
    };
  }
}

// 대량 발송
export async function sendBulkAlimtalk(
  recipients: {
    phone: string;
    templateCode: string;
    variables?: Record<string, string>;
  }[]
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  // 순차 발송 (rate limit 고려)
  for (const recipient of recipients) {
    const result = await sendAlimtalk({
      to: recipient.phone,
      templateCode: recipient.templateCode,
      variables: recipient.variables,
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
