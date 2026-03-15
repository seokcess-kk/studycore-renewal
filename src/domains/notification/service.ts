/**
 * Notification 도메인 - 서비스
 *
 * 이 파일에는 비즈니스 로직만 포함합니다.
 * ⚠️ DB 쿼리 금지 → repository.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 *
 * 실제 알림 발송은 Edge Functions에서 처리합니다.
 * 이 서비스는 수신자 조회 및 Edge Function 호출을 담당합니다.
 */

import { SupabaseClient } from "@supabase/supabase-js";
import * as repository from "./repository";
import {
  type NotificationServiceResult,
  type NotificationTargetListResult,
  type SendCustomNotificationInput,
  type NotificationTarget,
  type NotificationLog,
  NotificationStatus,
  NotificationType,
} from "./model";

// ─────────────────────────────────────────────
// 수신자 조회 서비스
// ─────────────────────────────────────────────

/**
 * 활성 재원생 연락처 조회
 */
export async function getActiveStudentContacts(
  supabase: SupabaseClient
): Promise<NotificationTargetListResult> {
  try {
    const targets = await repository.getActiveStudentContacts(supabase);

    return {
      success: true,
      targets,
    };
  } catch (error) {
    return {
      success: false,
      targets: [],
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 활성 재원생 + 학부모 연락처 조회
 */
export async function getActiveStudentAndParentContacts(
  supabase: SupabaseClient
): Promise<NotificationTargetListResult> {
  try {
    const targets = await repository.getActiveStudentAndParentContacts(
      supabase
    );

    return {
      success: true,
      targets,
    };
  } catch (error) {
    return {
      success: false,
      targets: [],
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 특정 사용자 연락처 조회
 */
export async function getUserContacts(
  supabase: SupabaseClient,
  userIds: string[],
  includeParents?: boolean
): Promise<NotificationTargetListResult> {
  try {
    const targets = await repository.getUserContacts(
      supabase,
      userIds,
      includeParents
    );

    return {
      success: true,
      targets,
    };
  } catch (error) {
    return {
      success: false,
      targets: [],
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

// ─────────────────────────────────────────────
// 알림 발송 서비스
// ─────────────────────────────────────────────

/**
 * Edge Function을 통한 알림 발송
 * 실제 발송 로직은 Edge Function에서 처리
 */
async function invokeNotificationFunction(
  supabase: SupabaseClient,
  functionName: string,
  payload: Record<string, unknown>
): Promise<NotificationServiceResult> {
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      sentCount: data?.sentCount || 0,
      failedCount: data?.failedCount || 0,
      logs: data?.logs || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 상담 신청 알림 발송
 */
export async function sendConsultNotification(
  supabase: SupabaseClient,
  consultData: {
    name: string;
    phone: string;
    school?: string;
    grade?: number;
    message?: string;
  }
): Promise<NotificationServiceResult> {
  return invokeNotificationFunction(supabase, "notify-consult", {
    type: NotificationType.CONSULT,
    data: consultData,
  });
}

/**
 * 질문 등록 알림 발송 (멘토에게)
 */
export async function sendQuestionNotification(
  supabase: SupabaseClient,
  questionData: {
    questionId: string;
    studentName: string;
    title: string;
    subject: string;
  }
): Promise<NotificationServiceResult> {
  return invokeNotificationFunction(supabase, "notify-question", {
    type: NotificationType.QUESTION,
    data: questionData,
  });
}

/**
 * 답변 등록 알림 발송 (학생에게)
 */
export async function sendAnswerNotification(
  supabase: SupabaseClient,
  answerData: {
    questionId: string;
    studentId: string;
    mentorName: string;
    questionTitle: string;
  }
): Promise<NotificationServiceResult> {
  return invokeNotificationFunction(supabase, "notify-answer", {
    type: NotificationType.ANSWER,
    data: answerData,
  });
}

/**
 * 수동 알림 발송 (어드민용)
 */
export async function sendCustomNotification(
  supabase: SupabaseClient,
  input: SendCustomNotificationInput
): Promise<NotificationServiceResult> {
  try {
    // 수신자 목록 조회
    let targets: NotificationTarget[] = [];

    if (input.targetType === "all") {
      if (input.includeParents) {
        targets = await repository.getActiveStudentAndParentContacts(supabase);
      } else {
        targets = await repository.getActiveStudentContacts(supabase);
      }
    } else if (input.targetType === "selected" && input.selectedUserIds) {
      targets = await repository.getUserContacts(
        supabase,
        input.selectedUserIds,
        input.includeParents
      );
    } else if (input.targetType === "parents") {
      const allTargets = await repository.getActiveStudentAndParentContacts(
        supabase
      );
      targets = allTargets.filter((t) => t.isParent);
    }

    if (targets.length === 0) {
      return {
        success: false,
        error: "발송 대상이 없습니다.",
      };
    }

    // Edge Function 호출
    return invokeNotificationFunction(supabase, "send-kakao-alimtalk", {
      type: NotificationType.CUSTOM,
      recipients: targets,
      message: input.message,
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

// ─────────────────────────────────────────────
// 미리보기 및 유틸리티
// ─────────────────────────────────────────────

/**
 * 알림 미리보기 생성
 */
export function generatePreview(
  message: string,
  variables?: Record<string, string>
): string {
  void variables; // 추후 사용자 정의 변수 지원 시 사용
  // 변수 치환
  let preview = message;

  // 기본 변수 예시 값
  const defaultVariables: Record<string, string> = {
    "#{이름}": "홍길동",
    "#{학교}": "○○고등학교",
    "#{학년}": "2",
    "#{제목}": "수학 질문입니다",
    "#{과목}": "수학",
    "#{멘토명}": "김멘토",
    "#{날짜}": new Date().toLocaleDateString("ko-KR"),
  };

  for (const [key, value] of Object.entries(defaultVariables)) {
    preview = preview.replace(new RegExp(key, "g"), value);
  }

  return preview;
}

/**
 * 발송 결과 로그 생성 (테스트용)
 */
export function createMockLogs(
  targets: NotificationTarget[],
  message: string
): NotificationLog[] {
  return targets.map((target, index) => ({
    id: `mock-${index}`,
    type: NotificationType.CUSTOM,
    recipient_phone: target.phone,
    recipient_name: target.name,
    message,
    status: NotificationStatus.PENDING,
    sent_at: new Date().toISOString(),
  }));
}
