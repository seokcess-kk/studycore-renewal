/**
 * Landing 도메인 - 모델 정의
 *
 * 광고 랜딩페이지(HTML 원본 보존). 어드민에서 HTML을 업로드하면
 * 고유 slug(/landing/[slug])로 서빙된다.
 *
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ DB 쿼리 금지 → repository.ts
 */

import { z } from "zod";

// HTML 최대 크기 (2MB)
export const MAX_LANDING_HTML_BYTES = 2_000_000;

export const landingSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  html_content: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Landing = z.infer<typeof landingSchema>;

export const createLandingSchema = z.object({
  slug: z
    .string()
    .min(2, "슬러그는 2자 이상 입력해주세요")
    .max(100, "슬러그는 100자 이하로 입력해주세요")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "슬러그는 영문 소문자, 숫자, 하이픈만 사용 가능합니다"
    ),
  name: z.string().min(1, "이름을 입력해주세요").max(100),
  html_content: z
    .string()
    .min(1, "HTML을 업로드하거나 입력해주세요")
    .max(MAX_LANDING_HTML_BYTES, "HTML이 너무 큽니다 (최대 2MB)"),
  is_active: z.boolean().optional(),
});

export type CreateLandingInput = z.infer<typeof createLandingSchema>;

export const updateLandingSchema = createLandingSchema.partial();
export type UpdateLandingInput = z.infer<typeof updateLandingSchema>;

export interface LandingServiceResult {
  success: boolean;
  landing?: Landing;
  error?: string;
}

/**
 * 이름에서 slug 자동 생성 (영문 소문자/숫자/하이픈만 추출).
 * 한글 등은 제거되므로, 결과가 비면 사용자가 직접 입력하도록 유도한다.
 * (blog의 generateSlug는 한글을 보존하므로 slug 검증과 맞지 않아 별도 정의)
 */
export function generateLandingSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // 영문/숫자/공백/하이픈 외 제거
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}
