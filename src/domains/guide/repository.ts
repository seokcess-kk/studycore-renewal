/**
 * Guide 도메인 - 리포지토리
 *
 * 이 파일에는 Supabase DB 쿼리만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ 타입 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  GuideSection,
  GuideSectionType,
  CreateGuideSectionInput,
  UpdateGuideSectionInput,
} from "./model";

/**
 * 모든 섹션 조회 (order_index 순)
 */
export async function getSections(
  supabase: SupabaseClient,
  type?: GuideSectionType
): Promise<GuideSection[]> {
  let query = supabase
    .from("guide_sections")
    .select("*")
    .order("order_index", { ascending: true });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`섹션 목록 조회 실패: ${error.message}`);
  }

  return data || [];
}

/**
 * 표시 가능한 섹션만 조회
 */
export async function getVisibleSections(
  supabase: SupabaseClient,
  type?: GuideSectionType
): Promise<GuideSection[]> {
  let query = supabase
    .from("guide_sections")
    .select("*")
    .eq("is_visible", true)
    .order("order_index", { ascending: true });

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`섹션 목록 조회 실패: ${error.message}`);
  }

  return data || [];
}

/**
 * 섹션 ID로 조회
 */
export async function getSectionById(
  supabase: SupabaseClient,
  id: string
): Promise<GuideSection | null> {
  const { data, error } = await supabase
    .from("guide_sections")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`섹션 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 섹션 생성
 */
export async function createSection(
  supabase: SupabaseClient,
  input: CreateGuideSectionInput
): Promise<GuideSection> {
  // order_index가 없으면 마지막 순서로
  let orderIndex = input.order_index;
  if (orderIndex === undefined) {
    const { data: maxOrder } = await supabase
      .from("guide_sections")
      .select("order_index")
      .order("order_index", { ascending: false })
      .limit(1)
      .single();

    orderIndex = (maxOrder?.order_index || 0) + 1;
  }

  const { data, error } = await supabase
    .from("guide_sections")
    .insert({
      title: input.title,
      content: input.content,
      order_index: orderIndex,
      is_visible: input.is_visible ?? true,
      type: input.type ?? "onboarding",
      category: input.category ?? "일반",
      icon: input.icon ?? "FileText",
      content_html: input.content_html ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`섹션 생성 실패: ${error.message}`);
  }

  return data;
}

/**
 * 섹션 수정
 */
export async function updateSection(
  supabase: SupabaseClient,
  id: string,
  input: UpdateGuideSectionInput
): Promise<GuideSection> {
  const { data, error } = await supabase
    .from("guide_sections")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`섹션 수정 실패: ${error.message}`);
  }

  return data;
}

/**
 * 섹션 삭제
 */
export async function deleteSection(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("guide_sections")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`섹션 삭제 실패: ${error.message}`);
  }
}

/**
 * 섹션 순서 일괄 업데이트
 */
export async function updateSectionOrders(
  supabase: SupabaseClient,
  orders: { id: string; order_index: number }[]
): Promise<void> {
  // 각 섹션 순서 개별 업데이트
  for (const order of orders) {
    const { error } = await supabase
      .from("guide_sections")
      .update({ order_index: order.order_index })
      .eq("id", order.id);

    if (error) {
      throw new Error(`섹션 순서 업데이트 실패: ${error.message}`);
    }
  }
}
