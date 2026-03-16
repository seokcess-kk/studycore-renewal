/**
 * Program 도메인 - 리포지토리
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Program, CreateProgramInput, UpdateProgramInput } from "./model";

export async function getActivePrograms(
  supabase: SupabaseClient
): Promise<Program[]> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`프로그램 조회 실패: ${error.message}`);
  return data || [];
}

export async function getPrograms(
  supabase: SupabaseClient,
  options?: { limit?: number; offset?: number }
): Promise<{ data: Program[]; count: number }> {
  let query = supabase
    .from("programs")
    .select("*", { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset)
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`프로그램 목록 조회 실패: ${error.message}`);
  return { data: data || [], count: count || 0 };
}

export async function getProgramById(
  supabase: SupabaseClient,
  id: string
): Promise<Program | null> {
  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`프로그램 조회 실패: ${error.message}`);
  }
  return data;
}

export async function createProgram(
  supabase: SupabaseClient,
  input: CreateProgramInput
): Promise<Program> {
  const { data, error } = await supabase
    .from("programs")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`프로그램 생성 실패: ${error.message}`);
  return data;
}

export async function updateProgram(
  supabase: SupabaseClient,
  id: string,
  input: UpdateProgramInput
): Promise<Program> {
  const { data, error } = await supabase
    .from("programs")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`프로그램 수정 실패: ${error.message}`);
  return data;
}

export async function deleteProgram(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) throw new Error(`프로그램 삭제 실패: ${error.message}`);
}
