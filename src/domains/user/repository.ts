/**
 * User 도메인 - 리포지토리
 *
 * 이 파일에는 Supabase DB 쿼리만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, CreateProfileInput, UpdateProfileInput } from "./model";

/**
 * 사용자 프로필 조회 (ID)
 */
export async function getProfileById(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`프로필 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 사용자 프로필 조회 (username)
 * SECURITY DEFINER 함수를 사용하여 RLS 우회 (로그인 전 조회용)
 */
export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .rpc("get_profile_by_username", { p_username: username })
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`프로필 조회 실패: ${error.message}`);
  }

  return data as Profile;
}

/**
 * 프로필 생성
 */
export async function createProfile(
  supabase: SupabaseClient,
  data: CreateProfileInput & { role?: string; status?: string }
): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .insert({
      id: data.id,
      name: data.name,
      phone: data.phone?.replace(/-/g, ""),
      school: data.school || null,
      grade: data.grade || null,
      parent_phone: data.parent_phone?.replace(/-/g, "") || null,
      role: data.role || "student",
      status: data.status || "pending",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`프로필 생성 실패: ${error.message}`);
  }

  return profile;
}

/**
 * 프로필 수정
 */
export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  data: UpdateProfileInput
): Promise<Profile> {
  const updateData: Record<string, unknown> = {};

  if (data.name) updateData.name = data.name;
  if (data.phone) updateData.phone = data.phone.replace(/-/g, "");
  if (data.school) updateData.school = data.school;
  if (data.grade) updateData.grade = data.grade;
  if (data.parent_phone)
    updateData.parent_phone = data.parent_phone.replace(/-/g, "");
  if (data.avatar_url) updateData.avatar_url = data.avatar_url;

  const { data: profile, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`프로필 수정 실패: ${error.message}`);
  }

  return profile;
}

/**
 * 사용자 상태 변경 (관리자용)
 */
export async function updateUserStatus(
  supabase: SupabaseClient,
  userId: string,
  status: "pending" | "active" | "inactive"
): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`상태 변경 실패: ${error.message}`);
  }

  return profile;
}

/**
 * 사용자 목록 조회 (관리자용)
 */
export async function getProfiles(
  supabase: SupabaseClient,
  options?: {
    role?: string;
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: Profile[]; count: number }> {
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.role) {
    query = query.eq("role", options.role);
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,phone.ilike.%${options.search}%`
    );
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit ?? 10) - 1
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`프로필 목록 조회 실패: ${error.message}`);
  }

  return { data: data || [], count: count || 0 };
}
