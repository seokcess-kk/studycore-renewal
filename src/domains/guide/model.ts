/**
 * Guide 도메인 - 모델 정의
 *
 * 이 파일에는 타입과 Zod 스키마만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ DB 쿼리 금지 → repository.ts
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────────

// 가이드 섹션 스키마
export const guideSectionTypeEnum = z.enum(["onboarding", "manual"]);
export type GuideSectionType = z.infer<typeof guideSectionTypeEnum>;

export const guideSectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  order_index: z.number(),
  is_visible: z.boolean(),
  type: guideSectionTypeEnum.default("onboarding"),
  created_at: z.string(),
  updated_at: z.string(),
});

export type GuideSection = z.infer<typeof guideSectionSchema>;

// 섹션 생성 스키마
export const createGuideSectionSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100),
  content: z.string().min(1, "내용을 입력해주세요"),
  order_index: z.number().optional(),
  is_visible: z.boolean().optional(),
  type: guideSectionTypeEnum.optional(),
});

export type CreateGuideSectionInput = z.infer<typeof createGuideSectionSchema>;

// 섹션 수정 스키마
export const updateGuideSectionSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요").max(100).optional(),
  content: z.string().min(1, "내용을 입력해주세요").optional(),
  order_index: z.number().optional(),
  is_visible: z.boolean().optional(),
});

export type UpdateGuideSectionInput = z.infer<typeof updateGuideSectionSchema>;

// ─────────────────────────────────────────────
// 서비스 결과 타입
// ─────────────────────────────────────────────

export interface GuideSectionServiceResult {
  success: boolean;
  section?: GuideSection;
  error?: string;
}

export interface GuideSectionListResult {
  success: boolean;
  sections: GuideSection[];
  error?: string;
}
