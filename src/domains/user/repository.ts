/**
 * User 도메인 - 리포지토리
 *
 * 이 파일에는 Supabase DB 쿼리만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Profile, CreateProfileInput, UpdateProfileInput } from "./model";
import { logger } from "@/lib/logger";

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

  // 빈 객체 체크
  if (Object.keys(updateData).length === 0) {
    throw new Error("수정할 데이터가 없습니다.");
  }

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
 * 어드민 회원 정보 수정 (null 허용)
 */
export async function adminUpdateMember(
  supabase: SupabaseClient,
  userId: string,
  data: {
    name: string;
    phone: string | null;
    school: string | null;
    grade: number | null;
    parent_phone: string | null;
  }
): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      name: data.name,
      phone: data.phone,
      school: data.school,
      grade: data.grade,
      parent_phone: data.parent_phone,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`회원 정보 수정 실패: ${error.message}`);
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

/**
 * Staff 통합 인증 RPC
 *
 * 단일 트랜잭션으로 처리:
 * - 계정 잠금 확인
 * - 비밀번호 검증 (staff_credentials)
 * - Staff 역할 확인
 * - 로그인 시도 기록
 *
 * @returns 인증 결과 (null = RPC 함수 없음, 레거시 fallback 필요)
 */
export async function authenticateStaff(
  supabase: SupabaseClient,
  username: string,
  password: string
): Promise<{
  success: boolean;
  error?: string;
  unlockAt?: string;
  profile?: Profile;
} | null> {
  const { data, error } = await supabase.rpc("authenticate_staff", {
    p_username: username,
    p_password: password,
  });

  if (error) {
    if (error.code === "42883" || error.message.includes("does not exist")) {
      logger.debug("authenticate_staff RPC 함수 없음, fallback 사용", { context: "authenticateStaff" });
      return null;
    }
    logger.error("authenticate_staff RPC 실패", { context: "authenticateStaff", data: error });
    return null;
  }

  const result = data as { success: boolean; error?: string; unlock_at?: string; profile?: Profile };
  return {
    success: result.success,
    error: result.error,
    unlockAt: result.unlock_at,
    profile: result.profile ?? undefined,
  };
}

/**
 * 스태프 비밀번호 변경 (RPC)
 */
export async function changeStaffPassword(
  supabase: SupabaseClient,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc("change_staff_password", {
    p_current_password: currentPassword,
    p_new_password: newPassword,
  });

  if (error) {
    logger.error("비밀번호 변경 RPC 실패", { context: "changeStaffPassword", data: error });
    return { success: false, error: "비밀번호 변경에 실패했습니다." };
  }

  const result = data as { success: boolean; error?: string };
  return result;
}
