/**
 * Review 도메인 - 모델 정의
 *
 * 이 파일에는 타입과 Zod 스키마만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ DB 쿼리 금지 → repository.ts
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────

export const ReviewCategory = {
  STUDENT: "student",
  PARENT: "parent",
  ALUMNI: "alumni",
} as const;

export type ReviewCategoryValue =
  (typeof ReviewCategory)[keyof typeof ReviewCategory];

export const CATEGORY_LABELS: Record<ReviewCategoryValue, string> = {
  student: "재원생",
  parent: "학부모",
  alumni: "졸업생",
};

// ─────────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────────

// Review DB 타입
export interface Review {
  id: string;
  author_id: string | null;
  author_name: string;
  category: ReviewCategoryValue;
  rating: number;
  content: string;
  images: string[];
  is_featured: boolean;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// 리뷰 목록 조회 결과
export interface ReviewListResult {
  reviews: Review[];
  total: number;
}

// 리뷰 통계
export interface ReviewStats {
  total: number;
  averageRating: number;
  distribution: Record<number, number>; // 1-5점 분포
}

// ─────────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────────

// 리뷰 작성 스키마
export const createReviewSchema = z.object({
  category: z.enum(["student", "parent", "alumni"]),
  rating: z.number().min(1).max(5),
  content: z.string().min(10, "10자 이상 작성해주세요").max(1000),
  images: z.array(z.string()).default([]),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// 리뷰 수정 스키마
export const updateReviewSchema = z.object({
  category: z.enum(["student", "parent", "alumni"]).optional(),
  rating: z.number().min(1).max(5).optional(),
  content: z.string().min(10).max(1000).optional(),
  images: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_visible: z.boolean().optional(),
});

export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;

// 리뷰 필터
export interface ReviewFilter {
  category?: ReviewCategoryValue;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────
// 서비스 결과 타입
// ─────────────────────────────────────────────

export interface ReviewServiceResult {
  success: boolean;
  review?: Review;
  error?: string;
}

export interface ReviewListServiceResult {
  success: boolean;
  reviews: Review[];
  total: number;
  error?: string;
}

export interface ReviewStatsResult {
  success: boolean;
  stats?: ReviewStats;
  error?: string;
}
