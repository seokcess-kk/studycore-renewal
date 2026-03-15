/**
 * Review 도메인 - 리포지토리
 *
 * 이 파일에는 Supabase DB 쿼리만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  Review,
  ReviewFilter,
  ReviewStats,
  CreateReviewInput,
  UpdateReviewInput,
} from "./model";

// ─────────────────────────────────────────────
// 조회
// ─────────────────────────────────────────────

/**
 * 리뷰 목록 조회 (공개)
 */
export async function getReviews(
  supabase: SupabaseClient,
  filter: ReviewFilter = {}
): Promise<{ reviews: Review[]; total: number }> {
  const { category, page = 1, limit = 10 } = filter;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("reviews")
    .select("*", { count: "exact" })
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`리뷰 목록 조회 실패: ${error.message}`);
  }

  return {
    reviews: (data || []) as Review[],
    total: count || 0,
  };
}

/**
 * 대표 리뷰 조회
 */
export async function getFeaturedReviews(
  supabase: SupabaseClient,
  limit: number = 5
): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("is_visible", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`대표 리뷰 조회 실패: ${error.message}`);
  }

  return (data || []) as Review[];
}

/**
 * 리뷰 상세 조회
 */
export async function getReviewById(
  supabase: SupabaseClient,
  id: string
): Promise<Review | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`리뷰 조회 실패: ${error.message}`);
  }

  return data as Review;
}

/**
 * 리뷰 통계 조회
 */
export async function getReviewStats(
  supabase: SupabaseClient
): Promise<ReviewStats> {
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("is_visible", true);

  if (error) {
    throw new Error(`리뷰 통계 조회 실패: ${error.message}`);
  }

  const reviews = data || [];
  const total = reviews.length;

  if (total === 0) {
    return {
      total: 0,
      averageRating: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  reviews.forEach((review) => {
    sum += review.rating;
    distribution[review.rating] = (distribution[review.rating] || 0) + 1;
  });

  return {
    total,
    averageRating: Math.round((sum / total) * 10) / 10,
    distribution,
  };
}

// ─────────────────────────────────────────────
// 생성/수정/삭제
// ─────────────────────────────────────────────

/**
 * 리뷰 생성
 */
export async function createReview(
  supabase: SupabaseClient,
  authorId: string,
  authorName: string,
  input: CreateReviewInput
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      author_id: authorId,
      author_name: authorName,
      category: input.category,
      rating: input.rating,
      content: input.content,
      images: input.images || [],
      is_featured: false,
      is_visible: true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`리뷰 생성 실패: ${error.message}`);
  }

  return data as Review;
}

/**
 * 리뷰 수정
 */
export async function updateReview(
  supabase: SupabaseClient,
  id: string,
  input: UpdateReviewInput
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`리뷰 수정 실패: ${error.message}`);
  }

  return data as Review;
}

/**
 * 리뷰 삭제
 */
export async function deleteReview(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) {
    throw new Error(`리뷰 삭제 실패: ${error.message}`);
  }
}
