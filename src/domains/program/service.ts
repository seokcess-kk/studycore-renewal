/**
 * Program 도메인 - 서비스
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  createProgramSchema,
  updateProgramSchema,
  type CreateProgramInput,
  type UpdateProgramInput,
  type ProgramServiceResult,
  type Program,
  type ProgramAttachment,
} from "./model";
import * as programRepo from "./repository";

export async function getActivePrograms(
  supabase: SupabaseClient
): Promise<Program[]> {
  try {
    return await programRepo.getActivePrograms(supabase);
  } catch (error) {
    console.error("활성 프로그램 조회 실패:", error);
    return [];
  }
}

export async function getProgramList(
  supabase: SupabaseClient,
  options?: { page?: number; pageSize?: number }
): Promise<{ programs: Program[]; total: number; page: number; pageSize: number }> {
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const { data, count } = await programRepo.getPrograms(supabase, {
    limit: pageSize,
    offset,
  });

  return { programs: data, total: count, page, pageSize };
}

export async function getProgramDetail(
  supabase: SupabaseClient,
  id: string
): Promise<ProgramServiceResult> {
  try {
    const program = await programRepo.getProgramById(supabase, id);
    if (!program) return { success: false, error: "프로그램을 찾을 수 없습니다." };
    return { success: true, program };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "프로그램 조회 실패",
    };
  }
}

export async function createProgram(
  supabase: SupabaseClient,
  input: CreateProgramInput
): Promise<ProgramServiceResult> {
  try {
    const validation = createProgramSchema.safeParse(input);
    if (!validation.success)
      return { success: false, error: validation.error.issues[0].message };

    const program = await programRepo.createProgram(supabase, validation.data);
    return { success: true, program };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "프로그램 생성 실패",
    };
  }
}

export async function updateProgram(
  supabase: SupabaseClient,
  id: string,
  input: UpdateProgramInput
): Promise<ProgramServiceResult> {
  try {
    const validation = updateProgramSchema.safeParse(input);
    if (!validation.success)
      return { success: false, error: validation.error.issues[0].message };

    const program = await programRepo.updateProgram(supabase, id, validation.data);
    return { success: true, program };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "프로그램 수정 실패",
    };
  }
}

export async function deleteProgram(
  supabase: SupabaseClient,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await programRepo.deleteProgram(supabase, id);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "프로그램 삭제 실패",
    };
  }
}

// ─── 첨부파일 ───

export async function getProgramAttachments(
  supabase: SupabaseClient,
  programId: string
): Promise<ProgramAttachment[]> {
  try {
    return await programRepo.getProgramAttachments(supabase, programId);
  } catch (error) {
    console.error("첨부파일 조회 실패:", error);
    return [];
  }
}

export async function addProgramAttachment(
  supabase: SupabaseClient,
  data: {
    program_id: string;
    file_name: string;
    file_url: string;
    file_size?: number;
    file_type?: string;
  }
): Promise<{ success: boolean; attachment?: ProgramAttachment; error?: string }> {
  try {
    const attachment = await programRepo.addProgramAttachment(supabase, data);
    return { success: true, attachment };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "첨부파일 추가 실패",
    };
  }
}

export async function deleteProgramAttachment(
  supabase: SupabaseClient,
  attachmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await programRepo.deleteProgramAttachment(supabase, attachmentId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "첨부파일 삭제 실패",
    };
  }
}
