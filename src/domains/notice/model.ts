/**
 * Notice 도메인 - 모델 정의
 *
 * 이 파일에는 타입과 Zod 스키마만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ DB 쿼리 금지 → repository.ts
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────

export const NoticeCategory = {
  GENERAL: "general",
  URGENT: "urgent",
  MATERIAL: "material",
  SCHEDULE: "schedule",
  EVENT: "event",
} as const;

export type NoticeCategoryType =
  (typeof NoticeCategory)[keyof typeof NoticeCategory];

// 별칭 (호환성)
export type NoticeCategory = NoticeCategoryType;

export const NOTICE_CATEGORY_LABELS: Record<NoticeCategoryType, string> = {
  general: "일반",
  urgent: "긴급",
  material: "교재",
  schedule: "일정",
  event: "행사",
};

// ─────────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────────

// 공지사항 스키마
export const noticeSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  category: z.enum(["general", "urgent", "material", "schedule", "event"]),
  is_pinned: z.boolean(),
  is_published: z.boolean(),
  order_index: z.number(),
  view_count: z.number(),
  author_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Notice = z.infer<typeof noticeSchema>;

// 공지사항 + 작성자 정보
export const noticeWithAuthorSchema = noticeSchema.extend({
  author: z.object({
    name: z.string(),
    avatar_url: z.string().nullable(),
  }).nullable(),
});

export type NoticeWithAuthor = z.infer<typeof noticeWithAuthorSchema>;

// 첨부파일 스키마
export const noticeAttachmentSchema = z.object({
  id: z.string().uuid(),
  notice_id: z.string().uuid(),
  file_name: z.string(),
  file_url: z.string(),
  file_size: z.number().nullable(),
  file_type: z.string().nullable(),
  created_at: z.string(),
});

export type NoticeAttachment = z.infer<typeof noticeAttachmentSchema>;

// 공지사항 생성 스키마
export const createNoticeSchema = z.object({
  title: z.string().min(2, "제목은 2자 이상 입력해주세요").max(100),
  content: z.string().min(10, "내용은 10자 이상 입력해주세요"),
  category: z.enum(["general", "urgent", "material", "schedule", "event"]),
  is_pinned: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;

// 공지사항 수정 스키마
export const updateNoticeSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  content: z.string().min(10).optional(),
  category: z
    .enum(["general", "urgent", "material", "schedule", "event"])
    .optional(),
  is_pinned: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;

// ─────────────────────────────────────────────
// 서비스 결과 타입
// ─────────────────────────────────────────────

export interface NoticeServiceResult {
  success: boolean;
  notice?: Notice | NoticeWithAuthor;
  error?: string;
}

export interface NoticeListResult {
  success: boolean;
  notices: NoticeWithAuthor[];
  total: number;
  page: number;
  pageSize: number;
  error?: string;
}

// 스키마 별칭 (어드민 페이지용)
export const CreateNoticeInputSchema = createNoticeSchema;
export const UpdateNoticeInputSchema = updateNoticeSchema;
