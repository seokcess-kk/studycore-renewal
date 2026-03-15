/**
 * Guide 도메인 - 서비스
 *
 * 이 파일에는 비즈니스 로직만 포함합니다.
 * ⚠️ DB 쿼리 금지 → repository.ts 경유
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  createGuideSectionSchema,
  updateGuideSectionSchema,
  type CreateGuideSectionInput,
  type UpdateGuideSectionInput,
  type GuideSectionServiceResult,
  type GuideSectionListResult,
} from "./model";
import * as guideRepo from "./repository";

/**
 * 섹션 목록 조회 (관리자용 - 모든 섹션)
 */
export async function getSectionList(
  supabase: SupabaseClient
): Promise<GuideSectionListResult> {
  try {
    const sections = await guideRepo.getSections(supabase);

    return {
      success: true,
      sections,
    };
  } catch (error) {
    console.error("섹션 목록 조회 실패:", error);
    return {
      success: false,
      sections: [],
      error:
        error instanceof Error
          ? error.message
          : "섹션 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 표시 가능한 섹션 목록 조회 (조교/멘토용)
 */
export async function getVisibleSectionList(
  supabase: SupabaseClient
): Promise<GuideSectionListResult> {
  try {
    const sections = await guideRepo.getVisibleSections(supabase);

    return {
      success: true,
      sections,
    };
  } catch (error) {
    console.error("섹션 목록 조회 실패:", error);
    return {
      success: false,
      sections: [],
      error:
        error instanceof Error
          ? error.message
          : "섹션 목록 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 섹션 생성
 */
export async function createSection(
  supabase: SupabaseClient,
  input: CreateGuideSectionInput
): Promise<GuideSectionServiceResult> {
  try {
    // 유효성 검사
    const validationResult = createGuideSectionSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    const section = await guideRepo.createSection(
      supabase,
      validationResult.data
    );

    return { success: true, section };
  } catch (error) {
    console.error("섹션 생성 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "섹션 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 섹션 수정
 */
export async function updateSection(
  supabase: SupabaseClient,
  id: string,
  input: UpdateGuideSectionInput
): Promise<GuideSectionServiceResult> {
  try {
    // 1. 기존 섹션 확인
    const existingSection = await guideRepo.getSectionById(supabase, id);
    if (!existingSection) {
      return {
        success: false,
        error: "섹션을 찾을 수 없습니다.",
      };
    }

    // 2. 유효성 검사
    const validationResult = updateGuideSectionSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 3. 수정
    const section = await guideRepo.updateSection(
      supabase,
      id,
      validationResult.data
    );

    return { success: true, section };
  } catch (error) {
    console.error("섹션 수정 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "섹션 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 섹션 삭제
 */
export async function deleteSection(
  supabase: SupabaseClient,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. 기존 섹션 확인
    const existingSection = await guideRepo.getSectionById(supabase, id);
    if (!existingSection) {
      return {
        success: false,
        error: "섹션을 찾을 수 없습니다.",
      };
    }

    // 2. 삭제
    await guideRepo.deleteSection(supabase, id);

    return { success: true };
  } catch (error) {
    console.error("섹션 삭제 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "섹션 삭제 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 섹션 순서 변경
 */
export async function updateSectionOrders(
  supabase: SupabaseClient,
  orders: { id: string; order_index: number }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await guideRepo.updateSectionOrders(supabase, orders);
    return { success: true };
  } catch (error) {
    console.error("섹션 순서 변경 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "섹션 순서 변경 중 오류가 발생했습니다.",
    };
  }
}
