/**
 * User 도메인 - 서비스
 *
 * 이 파일에는 비즈니스 로직만 포함합니다.
 * ⚠️ DB 쿼리 금지 → repository.ts 경유
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  staffLoginSchema,
  createProfileSchema,
  updateProfileSchema,
  type StaffLoginInput,
  type CreateProfileInput,
  type UpdateProfileInput,
  type UserServiceResult,
  type AuthResult,
} from "./model";
import * as userRepo from "./repository";

/**
 * Staff 로그인 (아이디 + 비밀번호)
 *
 * username → 더미 이메일(username@studycore.internal) → signInWithPassword
 */
export async function staffLogin(
  supabase: SupabaseClient,
  input: StaffLoginInput
): Promise<AuthResult> {
  try {
    // 1. 유효성 검사
    const validationResult = staffLoginSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 2. username으로 프로필 조회
    const profile = await userRepo.getProfileByUsername(
      supabase,
      input.username
    );
    if (!profile) {
      return {
        success: false,
        error: "존재하지 않는 아이디입니다.",
      };
    }

    // 3. Staff 역할 확인
    if (!["admin", "mentor", "assistant"].includes(profile.role)) {
      return {
        success: false,
        error: "Staff 계정이 아닙니다.",
      };
    }

    // 4. 더미 이메일로 로그인 시도
    const dummyEmail = `${input.username}@studycore.internal`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: input.password,
    });

    if (error) {
      return {
        success: false,
        error: "아이디 또는 비밀번호가 올바르지 않습니다.",
      };
    }

    return {
      success: true,
      user: data.user
        ? { id: data.user.id, email: data.user.email || "" }
        : undefined,
      profile,
    };
  } catch (error) {
    console.error("Staff 로그인 실패:", error);
    return {
      success: false,
      error: "로그인 처리 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 카카오 로그인 후 프로필 생성/조회
 */
export async function handleKakaoAuth(
  supabase: SupabaseClient,
  userId: string
): Promise<UserServiceResult> {
  try {
    // 1. 기존 프로필 확인
    const existingProfile = await userRepo.getProfileById(supabase, userId);
    if (existingProfile) {
      return { success: true, profile: existingProfile };
    }

    // 2. 프로필이 없으면 null 반환 (추가 정보 입력 필요)
    return {
      success: true,
      profile: undefined,
    };
  } catch (error) {
    console.error("카카오 인증 처리 실패:", error);
    return {
      success: false,
      error: "인증 처리 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 프로필 생성 (카카오 가입 완료)
 */
export async function createUserProfile(
  supabase: SupabaseClient,
  input: CreateProfileInput
): Promise<UserServiceResult> {
  try {
    // 1. 유효성 검사
    const validationResult = createProfileSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 2. 프로필 생성
    const profile = await userRepo.createProfile(supabase, {
      ...validationResult.data,
      role: "student",
      status: "pending", // 관리자 승인 대기
    });

    return { success: true, profile };
  } catch (error) {
    console.error("프로필 생성 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "프로필 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 프로필 수정
 */
export async function updateUserProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateProfileInput
): Promise<UserServiceResult> {
  try {
    // 1. 유효성 검사
    const validationResult = updateProfileSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 2. 프로필 수정
    const profile = await userRepo.updateProfile(
      supabase,
      userId,
      validationResult.data
    );

    return { success: true, profile };
  } catch (error) {
    console.error("프로필 수정 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "프로필 수정 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 현재 로그인한 사용자 프로필 조회
 */
export async function getCurrentProfile(
  supabase: SupabaseClient
): Promise<UserServiceResult> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "로그인이 필요합니다.",
      };
    }

    const profile = await userRepo.getProfileById(supabase, user.id);

    if (!profile) {
      return {
        success: false,
        error: "프로필이 존재하지 않습니다.",
      };
    }

    return { success: true, profile };
  } catch (error) {
    console.error("프로필 조회 실패:", error);
    return {
      success: false,
      error: "프로필 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 로그아웃
 */
export async function signOut(
  supabase: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("로그아웃 실패:", error);
    return {
      success: false,
      error: "로그아웃 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 사용자 상태 변경 (관리자용)
 */
export async function changeUserStatus(
  supabase: SupabaseClient,
  userId: string,
  newStatus: "pending" | "active" | "inactive"
): Promise<UserServiceResult> {
  try {
    const profile = await userRepo.updateUserStatus(supabase, userId, newStatus);
    return { success: true, profile };
  } catch (error) {
    console.error("상태 변경 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "상태 변경 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 프로필 이미지 업데이트
 */
export async function updateAvatar(
  supabase: SupabaseClient,
  userId: string,
  avatarUrl: string | null
): Promise<UserServiceResult> {
  try {
    const profile = await userRepo.updateProfile(supabase, userId, {
      avatar_url: avatarUrl ?? undefined,
    });
    return { success: true, profile };
  } catch (error) {
    console.error("아바타 업데이트 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "프로필 이미지 업데이트 중 오류가 발생했습니다.",
    };
  }
}
