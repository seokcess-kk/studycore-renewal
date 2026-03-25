/**
 * Space 도메인 - 서비스
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  createSpaceSchema,
  updateSpaceSchema,
  type CreateSpaceInput,
  type UpdateSpaceInput,
  type SpaceServiceResult,
  type Space,
} from "./model";
import * as spaceRepo from "./repository";

export async function getActiveSpaces(
  supabase: SupabaseClient
): Promise<Space[]> {
  try {
    return await spaceRepo.getActiveSpaces(supabase);
  } catch (error) {
    console.error("활성 공간 조회 실패:", error);
    return [];
  }
}

export async function getSpaceList(
  supabase: SupabaseClient,
  options?: { page?: number; pageSize?: number }
): Promise<{ spaces: Space[]; total: number; page: number; pageSize: number }> {
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const { data, count } = await spaceRepo.getSpaces(supabase, {
    limit: pageSize,
    offset,
  });

  return { spaces: data, total: count, page, pageSize };
}

export async function getSpaceDetail(
  supabase: SupabaseClient,
  id: string
): Promise<SpaceServiceResult> {
  try {
    const space = await spaceRepo.getSpaceById(supabase, id);
    if (!space) return { success: false, error: "공간을 찾을 수 없습니다." };
    return { success: true, space };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "공간 조회 실패",
    };
  }
}

export async function createSpace(
  supabase: SupabaseClient,
  input: CreateSpaceInput
): Promise<SpaceServiceResult> {
  try {
    const validation = createSpaceSchema.safeParse(input);
    if (!validation.success)
      return { success: false, error: validation.error.issues[0].message };

    const space = await spaceRepo.createSpace(supabase, validation.data);
    return { success: true, space };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "공간 생성 실패",
    };
  }
}

export async function updateSpace(
  supabase: SupabaseClient,
  id: string,
  input: UpdateSpaceInput
): Promise<SpaceServiceResult> {
  try {
    const validation = updateSpaceSchema.safeParse(input);
    if (!validation.success)
      return { success: false, error: validation.error.issues[0].message };

    const space = await spaceRepo.updateSpace(supabase, id, validation.data);
    return { success: true, space };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "공간 수정 실패",
    };
  }
}

export async function deleteSpace(
  supabase: SupabaseClient,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await spaceRepo.deleteSpace(supabase, id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "공간 삭제 실패",
    };
  }
}
