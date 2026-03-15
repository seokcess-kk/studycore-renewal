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
 * 사용자 프로필 조회 (username)
 * RPC 함수가 없으면 직접 쿼리로 fallback
 */
export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<Profile | null> {
  // 먼저 RPC 함수 시도
  const { data: rpcData, error: rpcError } = await supabase
    .rpc("get_profile_by_username", { p_username: username })
    .single();

  // RPC 함수가 존재하고 성공한 경우
  if (!rpcError) {
    return rpcData as Profile;
  }

  // RPC 함수가 없거나 에러인 경우 직접 쿼리 (fallback)
  // 42883: function does not exist
  if (rpcError.code === "42883" || rpcError.message.includes("does not exist")) {
    logger.debug("RPC 함수 없음, 직접 쿼리 사용", { context: "getProfileByUsername" });

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      logger.error("프로필 조회 실패", { context: "getProfileByUsername", data: error });
      return null;
    }

    return data as Profile;
  }

  // 결과 없음
  if (rpcError.code === "PGRST116") {
    return null;
  }

  logger.error("프로필 조회 실패", { context: "getProfileByUsername", data: rpcError });
  return null;
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
 * 계정 잠금 상태 확인 (RPC)
 * check_account_lockout RPC 함수 사용
 * RPC 함수가 없으면 null 반환 (잠금 기능 비활성)
 */
export async function checkAccountLockout(
  supabase: SupabaseClient,
  username: string
): Promise<{ isLocked: boolean; failedAttempts: number; unlockAt: string | null } | null> {
  const { data, error } = await supabase
    .rpc("check_account_lockout", { p_username: username })
    .single<{ is_locked: boolean; failed_attempts: number; unlock_at: string | null }>();

  if (error) {
    // RPC 함수가 없는 경우
    if (error.code === "42883" || error.message.includes("does not exist")) {
      return null;
    }
    logger.warn("계정 잠금 상태 확인 실패", { context: "checkAccountLockout", data: error });
    return null;
  }

  return {
    isLocked: data.is_locked,
    failedAttempts: data.failed_attempts,
    unlockAt: data.unlock_at,
  };
}

/**
 * 로그인 시도 기록 (RPC)
 * record_login_attempt RPC 함수 사용
 */
export async function recordLoginAttempt(
  supabase: SupabaseClient,
  username: string,
  success: boolean
): Promise<void> {
  const { error } = await supabase.rpc("record_login_attempt", {
    p_username: username,
    p_success: success,
  });

  if (error) {
    // RPC 함수가 없어도 무시 (선택적 기능)
    if (error.code !== "42883" && !error.message.includes("does not exist")) {
      logger.warn("로그인 시도 기록 실패", { context: "recordLoginAttempt", data: error });
    }
  }
}

/**
 * Staff 비밀번호 검증 (RPC)
 * verify_staff_password RPC 함수 사용
 * RPC 함수가 없으면 null 반환 (fallback 필요)
 */
export async function verifyStaffPassword(
  supabase: SupabaseClient,
  username: string,
  password: string
): Promise<{ userId: string; isValid: boolean } | null> {
  const { data, error } = await supabase
    .rpc("verify_staff_password", {
      p_username: username,
      p_password: password,
    })
    .single<{ user_id: string; is_valid: boolean }>();

  // RPC 함수가 없는 경우
  if (error) {
    if (error.code === "42883" || error.message.includes("does not exist")) {
      logger.debug("verify_staff_password RPC 함수 없음, fallback 사용", { context: "verifyStaffPassword" });
      return null;
    }
    // 결과 없음 (사용자 없음)
    if (error.code === "PGRST116") {
      return { userId: "", isValid: false };
    }
    logger.error("Staff 비밀번호 검증 실패", { context: "verifyStaffPassword", data: error });
    return null;
  }

  return {
    userId: data.user_id,
    isValid: data.is_valid,
  };
}
