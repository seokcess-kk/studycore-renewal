/**
 * Popup 도메인 - 리포지토리
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Popup, CreatePopupInput, UpdatePopupInput } from "./model";

export async function getActivePopups(
  supabase: SupabaseClient
): Promise<Popup[]> {
  const { data, error } = await supabase
    .from("popups")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", new Date().toISOString())
    .gte("end_date", new Date().toISOString())
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`팝업 조회 실패: ${error.message}`);
  return data || [];
}

export async function getPopups(
  supabase: SupabaseClient,
  options?: { limit?: number; offset?: number }
): Promise<{ data: Popup[]; count: number }> {
  let query = supabase
    .from("popups")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset)
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`팝업 목록 조회 실패: ${error.message}`);
  return { data: data || [], count: count || 0 };
}

export async function getPopupById(
  supabase: SupabaseClient,
  id: string
): Promise<Popup | null> {
  const { data, error } = await supabase
    .from("popups")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`팝업 조회 실패: ${error.message}`);
  }
  return data;
}

export async function createPopup(
  supabase: SupabaseClient,
  input: CreatePopupInput
): Promise<Popup> {
  const { data, error } = await supabase
    .from("popups")
    .insert({
      ...input,
      link_url: input.link_url || null,
    })
    .select()
    .single();

  if (error) throw new Error(`팝업 생성 실패: ${error.message}`);
  return data;
}

export async function updatePopup(
  supabase: SupabaseClient,
  id: string,
  input: UpdatePopupInput
): Promise<Popup> {
  const { data, error } = await supabase
    .from("popups")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(`팝업 수정 실패: ${error.message}`);
  return data;
}

export async function deletePopup(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("popups").delete().eq("id", id);
  if (error) throw new Error(`팝업 삭제 실패: ${error.message}`);
}
