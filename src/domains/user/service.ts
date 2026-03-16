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
import { isStaffRole } from "@/lib/constants";
import { logger } from "@/lib/logger";

// 로그인 실패 공통 에러 메시지 (보안: 아이디/비밀번호 구분 노출 방지)
const LOGIN_ERROR_MESSAGE = "아이디 또는 비밀번호가 올바르지 않습니다.";

/**
 * Supabase Auth 로그인 헬퍼
 */
async function signInWithDummyEmail(
  supabase: SupabaseClient,
  username: string,
  password: string
) {
  const dummyEmail = `${username}@studycore.internal`;
  return supabase.auth.signInWithPassword({
    email: dummyEmail,
    password,
  });
}

/**
 * Staff 로그인 (아이디 + 비밀번호)
 *
 * 보안 강화 버전:
 * 1. 계정 잠금 상태 확인 (5회 실패 시 15분 잠금)
 * 2. RPC 기반 비밀번호 검증 시도 (verify_staff_password)
 * 3. RPC 함수 없으면 기존 더미 이메일 방식으로 fallback
 * 4. 로그인 시도 기록
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

    // 2. 계정 잠금 상태 확인
    const lockoutStatus = await userRepo.checkAccountLockout(supabase, input.username);
    if (lockoutStatus?.isLocked) {
      const unlockTime = lockoutStatus.unlockAt
        ? new Date(lockoutStatus.unlockAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
        : "잠시 후";
      return {
        success: false,
        error: `로그인 시도 횟수를 초과했습니다. ${unlockTime}에 다시 시도해주세요.`,
      };
    }

    // 3. username으로 프로필 조회
    const profile = await userRepo.getProfileByUsername(
      supabase,
      input.username
    );
    if (!profile) {
      // 실패 기록 (존재하지 않는 계정도 기록)
      await userRepo.recordLoginAttempt(supabase, input.username, false);
      return {
        success: false,
        error: LOGIN_ERROR_MESSAGE, // 보안: 아이디 존재 여부 숨김
      };
    }

    // 4. Staff 역할 확인
    if (!isStaffRole(profile.role)) {
      return {
        success: false,
        error: LOGIN_ERROR_MESSAGE, // 보안: 역할 정보 숨김
      };
    }

    // 5. RPC 기반 비밀번호 검증 시도
    const rpcResult = await userRepo.verifyStaffPassword(
      supabase,
      input.username,
      input.password
    );

    // RPC 함수가 존재하고 검증 성공
    if (rpcResult !== null) {
      if (!rpcResult.isValid) {
        // 실패 기록
        await userRepo.recordLoginAttempt(supabase, input.username, false);
        return {
          success: false,
          error: LOGIN_ERROR_MESSAGE,
        };
      }

      // 검증 성공 - 세션 생성을 위해 더미 이메일로 로그인
      const { data, error } = await signInWithDummyEmail(supabase, input.username, input.password);

      if (error) {
        // RPC 검증은 성공했지만 Supabase Auth 비밀번호가 다른 경우
        // 이 경우는 마이그레이션 불일치 - fallback 필요
        logger.warn("RPC 검증 성공, Auth 로그인 실패 - fallback", { context: "staffLogin" });
      } else {
        // 성공 기록
        await userRepo.recordLoginAttempt(supabase, input.username, true);
        return {
          success: true,
          user: data.user
            ? { id: data.user.id, email: data.user.email || "" }
            : undefined,
          profile,
        };
      }
    }

    // 6. Fallback: 기존 더미 이메일 방식
    const { data, error } = await signInWithDummyEmail(supabase, input.username, input.password);

    if (error) {
      // 실패 기록
      await userRepo.recordLoginAttempt(supabase, input.username, false);
      return {
        success: false,
        error: LOGIN_ERROR_MESSAGE,
      };
    }

    // 성공 기록
    await userRepo.recordLoginAttempt(supabase, input.username, true);
    return {
      success: true,
      user: data.user
        ? { id: data.user.id, email: data.user.email || "" }
        : undefined,
      profile,
    };
  } catch (error) {
    logger.exception(error, "staffLogin");
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
    logger.exception(error, "handleKakaoAuth");
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
    logger.exception(error, "createUserProfile");
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
    logger.exception(error, "updateUserProfile");
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
    logger.exception(error, "getCurrentProfile");
    return {
      success: false,
      error: "프로필 조회 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 로그아웃
 *
 * 쿠키를 먼저 삭제 후, 서버 세션 무효화를 최대 2초 대기.
 * 타임아웃 시에도 쿠키는 이미 삭제되어 있으므로 로그아웃은 보장됩니다.
 */
export async function signOut(supabase: SupabaseClient): Promise<void> {
  // 1. 쿠키 즉시 삭제 (리로드 시 미들웨어가 세션을 못 찾게)
  clearSupabaseCookies();

  // 2. Supabase 서버에 세션 무효화 요청 (최대 2초 대기)
  try {
    await Promise.race([
      supabase.auth.signOut(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("signOut timeout")), 2000)
      ),
    ]);
  } catch {
    logger.warn("signOut 서버 요청 실패/타임아웃 (쿠키는 이미 삭제됨)", {
      context: "signOut",
    });
  }
}

/** Supabase 인증 쿠키 수동 삭제 */
function clearSupabaseCookies() {
  if (typeof document === "undefined") return;

  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (name.startsWith("sb-") && name.includes("auth-token")) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
    }
  });
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
    logger.exception(error, "changeUserStatus");
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
    logger.exception(error, "updateAvatar");
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "프로필 이미지 업데이트 중 오류가 발생했습니다.",
    };
  }
}
