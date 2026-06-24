/**
 * Landing 도메인 - 리포지토리
 *
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Landing, CreateLandingInput, UpdateLandingInput } from "./model";

export async function getLandings(
  supabase: SupabaseClient,
  options?: { limit?: number; offset?: number }
): Promise<{ data: Landing[]; count: number }> {
  let query = supabase
    .from("landing_pages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset)
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`랜딩페이지 목록 조회 실패: ${error.message}`);
  return { data: data || [], count: count || 0 };
}

export async function getLandingById(
  supabase: SupabaseClient,
  id: string
): Promise<Landing | null> {
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`랜딩페이지 조회 실패: ${error.message}`);
  }
  return data;
}

/** 서빙용 — 활성(is_active=true) slug만 조회 */
export async function getLandingBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Landing | null> {
  const { data, error } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`랜딩페이지 조회 실패: ${error.message}`);
  }
  return data;
}

export async function createLanding(
  supabase: SupabaseClient,
  input: CreateLandingInput
): Promise<Landing> {
  const { data, error } = await supabase
    .from("landing_pages")
    .insert(input)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("이미 사용 중인 슬러그입니다.");
    throw new Error(`랜딩페이지 생성 실패: ${error.message}`);
  }
  return data;
}

export async function updateLanding(
  supabase: SupabaseClient,
  id: string,
  input: UpdateLandingInput
): Promise<Landing> {
  const { data, error } = await supabase
    .from("landing_pages")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") throw new Error("이미 사용 중인 슬러그입니다.");
    throw new Error(`랜딩페이지 수정 실패: ${error.message}`);
  }
  return data;
}

export async function deleteLanding(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("landing_pages").delete().eq("id", id);
  if (error) throw new Error(`랜딩페이지 삭제 실패: ${error.message}`);
}
