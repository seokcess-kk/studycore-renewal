/**
 * Popup 도메인 - 서비스
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  createPopupSchema,
  updatePopupSchema,
  type CreatePopupInput,
  type UpdatePopupInput,
  type PopupServiceResult,
  type Popup,
} from "./model";
import * as popupRepo from "./repository";

export async function getActivePopups(
  supabase: SupabaseClient
): Promise<Popup[]> {
  try {
    return await popupRepo.getActivePopups(supabase);
  } catch (error) {
    console.error("활성 팝업 조회 실패:", error);
    return [];
  }
}

export async function getPopupList(
  supabase: SupabaseClient,
  options?: { page?: number; pageSize?: number }
): Promise<{ popups: Popup[]; total: number; page: number; pageSize: number }> {
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const { data, count } = await popupRepo.getPopups(supabase, {
    limit: pageSize,
    offset,
  });

  return { popups: data, total: count, page, pageSize };
}

export async function getPopupDetail(
  supabase: SupabaseClient,
  id: string
): Promise<PopupServiceResult> {
  try {
    const popup = await popupRepo.getPopupById(supabase, id);
    if (!popup) return { success: false, error: "팝업을 찾을 수 없습니다." };
    return { success: true, popup };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "팝업 조회 실패",
    };
  }
}

export async function createPopup(
  supabase: SupabaseClient,
  input: CreatePopupInput
): Promise<PopupServiceResult> {
  try {
    const validation = createPopupSchema.safeParse(input);
    if (!validation.success)
      return { success: false, error: validation.error.issues[0].message };

    const popup = await popupRepo.createPopup(supabase, validation.data);
    return { success: true, popup };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "팝업 생성 실패",
    };
  }
}

export async function updatePopup(
  supabase: SupabaseClient,
  id: string,
  input: UpdatePopupInput
): Promise<PopupServiceResult> {
  try {
    const validation = updatePopupSchema.safeParse(input);
    if (!validation.success)
      return { success: false, error: validation.error.issues[0].message };

    const popup = await popupRepo.updatePopup(supabase, id, validation.data);
    return { success: true, popup };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "팝업 수정 실패",
    };
  }
}

export async function deletePopup(
  supabase: SupabaseClient,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await popupRepo.deletePopup(supabase, id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "팝업 삭제 실패",
    };
  }
}
