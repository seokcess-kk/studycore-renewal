/**
 * Review 도메인 - 서비스
 *
 * 이 파일에는 비즈니스 로직만 포함합니다.
 * ⚠️ DB 쿼리 금지 → repository.ts 경유
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  createReviewSchema,
  updateReviewSchema,
  type CreateReviewInput,
  type UpdateReviewInput,
  type ReviewFilter,
  type ReviewServiceResult,
  type ReviewListServiceResult,
  type ReviewStatsResult,
} from "./model";
import * as reviewRepo from "./repository";

/**
 * 리뷰 목록 조회
 */
export async function getReviews(
  supabase: SupabaseClient,
  filter: ReviewFilter = {}
): Promise<ReviewListServiceResult> {
  try {
    const result = await reviewRepo.getReviews(supabase, filter);

    return {
      success: true,
      reviews: result.reviews,
      total: result.total,
    };
  } catch (error) {
    console.error("리뷰 목록 조회 실패:", error);
    return {
      success: false,
      reviews: [],
      total: 0,
      error:
        error instanceof Error
          ? error.message
          : "리뷰 목록을 불러올 수 없습니다.",
    };
  }
}

/**
 * 대표 리뷰 조회
 */
export async function getFeaturedReviews(
  supabase: SupabaseClient,
  limit: number = 5
): Promise<ReviewListServiceResult> {
  try {
    const reviews = await reviewRepo.getFeaturedReviews(supabase, limit);

    return {
      success: true,
      reviews,
      total: reviews.length,
    };
  } catch (error) {
    console.error("대표 리뷰 조회 실패:", error);
    return {
      success: false,
      reviews: [],
      total: 0,
      error:
        error instanceof Error
          ? error.message
          : "대표 리뷰를 불러올 수 없습니다.",
    };
  }
}

/**
 * 리뷰 통계 조회
 */
export async function getReviewStats(
  supabase: SupabaseClient
): Promise<ReviewStatsResult> {
  try {
    const stats = await reviewRepo.getReviewStats(supabase);

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("리뷰 통계 조회 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "리뷰 통계를 불러올 수 없습니다.",
    };
  }
}

/**
 * 리뷰 작성
 */
export async function createReview(
  supabase: SupabaseClient,
  input: CreateReviewInput
): Promise<ReviewServiceResult> {
  try {
    // 유효성 검사
    const validationResult = createReviewSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 현재 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    // 프로필 조회
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, status")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        error: "프로필 정보를 찾을 수 없습니다.",
      };
    }

    if (profile.status !== "active") {
      return {
        success: false,
        error: "활성 상태의 재원생만 리뷰를 작성할 수 있습니다.",
      };
    }

    // 리뷰 생성
    const review = await reviewRepo.createReview(
      supabase,
      user.id,
      profile.name,
      validationResult.data
    );

    return { success: true, review };
  } catch (error) {
    console.error("리뷰 작성 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "리뷰 작성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 리뷰 수정
 */
export async function updateReview(
  supabase: SupabaseClient,
  id: string,
  input: UpdateReviewInput
): Promise<ReviewServiceResult> {
  try {
    // 유효성 검사
    const validationResult = updateReviewSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 리뷰 수정
    const review = await reviewRepo.updateReview(
      supabase,
      id,
      validationResult.data
    );

    return { success: true, review };
  } catch (error) {
    console.error("리뷰 수정 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "리뷰 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 리뷰 삭제
 */
export async function deleteReview(
  supabase: SupabaseClient,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await reviewRepo.deleteReview(supabase, id);
    return { success: true };
  } catch (error) {
    console.error("리뷰 삭제 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "리뷰 삭제 중 오류가 발생했습니다.",
    };
  }
}
