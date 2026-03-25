/**
 * Space 도메인 - 리포지토리
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Space, CreateSpaceInput, UpdateSpaceInput } from "./model";

export async function getActiveSpaces(
  supabase: SupabaseClient
): Promise<Space[]> {
  const { data, error } = await supabase
    .from("spaces")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`공간 조회 실패: ${error.message}`);
  return data || [];
}

export async function getSpaces(
  supabase: SupabaseClient,
  options?: { limit?: number; offset?: number }
): Promise<{ data: Space[]; count: number }> {
  let query = supabase
    .from("spaces")
    .select("*", { count: "exact" })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset)
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`공간 목록 조회 실패: ${error.message}`);
  return { data: data || [], count: count || 0 };
}

export async function getSpaceById(
  supabase: SupabaseClient,
  id: string
): Promise<Space | null> {
  const { data, error } = await supabase
    .from("spaces")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`공간 조회 실패: ${error.message}`);
  }
  return data;
}

export async function createSpace(
  supabase: SupabaseClient,
  input: CreateSpaceInput
): Promise<Space> {
  const { data, error } = await supabase
    .from("spaces")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(`공간 생성 실패: ${error.message}`);
  return data;
}

export async function updateSpace(
  supabase: SupabaseClient,
  id: string,
  input: UpdateSpaceInput
): Promise<Space> {
  const { data, error } = await supabase
    .from("spaces")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`공간 수정 실패: ${error.message}`);
  return data;
}

export async function deleteSpace(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("spaces").delete().eq("id", id);
  if (error) throw new Error(`공간 삭제 실패: ${error.message}`);
}
