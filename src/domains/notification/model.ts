/**
 * Notification 도메인 - 모델 정의
 *
 * 이 파일에는 타입과 Zod 스키마만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ DB 쿼리 금지 → repository.ts
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────

export const NotificationType = {
  CONSULT: "consult", // 상담 신청 알림
  QUESTION: "question", // 질문 등록 알림
  ANSWER: "answer", // 답변 등록 알림
  NOTICE: "notice", // 공지사항 알림
  CUSTOM: "custom", // 수동 발송
} as const;

export type NotificationTypeValue =
  (typeof NotificationType)[keyof typeof NotificationType];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationTypeValue, string> = {
  consult: "상담 신청",
  question: "질문 등록",
  answer: "답변 등록",
  notice: "공지사항",
  custom: "수동 발송",
};

export const NotificationStatus = {
  PENDING: "pending",
  SENT: "sent",
  FAILED: "failed",
} as const;

export type NotificationStatusValue =
  (typeof NotificationStatus)[keyof typeof NotificationStatus];

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// 알림 대상
export interface NotificationTarget {
  userId: string;
  name: string;
  phone: string;
  isParent?: boolean;
}

// 알림 로그 (응답용)
export interface NotificationLog {
  id: string;
  type: NotificationTypeValue;
  recipient_phone: string;
  recipient_name: string;
  message: string;
  status: NotificationStatusValue;
  error_message?: string;
  sent_at: string;
}

// 알림 로그 DB 타입
export interface NotificationLogDB {
  id: string;
  type: "sms" | "alimtalk";
  recipient_phone: string;
  recipient_name: string | null;
  message: string;
  template_code: string | null;
  status: "pending" | "sent" | "failed";
  error_message: string | null;
  sent_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// 알림 로그 생성 입력
export interface CreateNotificationLogInput {
  type: "sms" | "alimtalk";
  recipient_phone: string;
  recipient_name?: string;
  message: string;
  template_code?: string;
  status: "pending" | "sent" | "failed";
  error_message?: string;
  sent_by?: string;
  metadata?: Record<string, unknown>;
}

// 알림 로그 조회 필터
export interface NotificationLogFilter {
  type?: "sms" | "alimtalk";
  status?: "pending" | "sent" | "failed";
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// 알림 통계
export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

// ─────────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────────

// 알림 발송 요청 스키마
export const sendNotificationSchema = z.object({
  type: z.enum(["consult", "question", "answer", "notice", "custom"]),
  recipients: z.array(
    z.object({
      userId: z.string().uuid(),
      name: z.string(),
      phone: z.string(),
      isParent: z.boolean().optional(),
    })
  ),
  message: z.string().min(1, "메시지를 입력해주세요").max(1000),
  templateCode: z.string().optional(), // 알림톡 템플릿 코드
  variables: z.record(z.string(), z.string()).optional(), // 템플릿 변수
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;

// 수동 발송 스키마 (어드민용)
export const sendCustomNotificationSchema = z.object({
  targetType: z.enum(["all", "selected", "parents"]),
  selectedUserIds: z.array(z.string().uuid()).optional(),
  includeParents: z.boolean().optional(),
  message: z.string().min(1, "메시지를 입력해주세요").max(1000),
});

export type SendCustomNotificationInput = z.infer<
  typeof sendCustomNotificationSchema
>;

// ─────────────────────────────────────────────
// 서비스 결과 타입
// ─────────────────────────────────────────────

export interface NotificationServiceResult {
  success: boolean;
  sentCount?: number;
  failedCount?: number;
  logs?: NotificationLog[];
  error?: string;
}

export interface NotificationTargetListResult {
  success: boolean;
  targets: NotificationTarget[];
  error?: string;
}

// ─────────────────────────────────────────────
// 알림톡 템플릿 코드
// ─────────────────────────────────────────────

export const ALIMTALK_TEMPLATES = {
  CONSULT_ADMIN: "SC_CONSULT_ADMIN", // 관리자에게 상담 신청 알림
  CONSULT_CUSTOMER: "SC_CONSULT_CUSTOMER", // 고객에게 상담 접수 확인
  QUESTION_MENTOR: "SC_QUESTION_MENTOR", // 멘토에게 질문 알림
  ANSWER_STUDENT: "SC_ANSWER_STUDENT", // 학생에게 답변 알림
  NOTICE_STUDENT: "SC_NOTICE_STUDENT", // 학생에게 공지 알림
  CUSTOM: "SC_CUSTOM", // 수동 발송
} as const;

// 스키마 별칭
export const SendNotificationInputSchema = sendNotificationSchema;
export const SendCustomNotificationInputSchema = sendCustomNotificationSchema;
