/**
 * User 도메인 - 모델 정의
 *
 * 이 파일에는 타입과 Zod 스키마만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ DB 쿼리 금지 → repository.ts
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────

export const UserRole = {
  STUDENT: "student",
  ASSISTANT: "assistant",
  MENTOR: "mentor",
  ADMIN: "admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type UserStatusType = (typeof UserStatus)[keyof typeof UserStatus];

// ─────────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────────

// 사용자 프로필 스키마
export const profileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().nullable(),
  name: z.string(),
  phone: z.string().nullable(),
  role: z.enum(["student", "assistant", "mentor", "admin"]),
  status: z.enum(["pending", "active", "inactive"]).nullable(),
  school: z.string().nullable(),
  grade: z.number().min(1).max(3).nullable(),
  parent_phone: z.string().nullable(),
  avatar_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;

// 프로필 생성 스키마 (카카오 가입용)
export const createProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, "이름은 2자 이상 입력해주세요"),
  phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, "올바른 전화번호를 입력해주세요"),
  school: z.string().optional(),
  grade: z.number().min(1).max(3).optional(),
  parent_phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, "올바른 전화번호를 입력해주세요")
    .optional(),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;

// 재원생 등록 스키마 (필수 필드 강화)
export const studentRegisterSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다"),
  phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, "올바른 전화번호 형식이 아닙니다"),
  school: z.string().min(2, "학교 이름을 입력해주세요"),
  grade: z.enum(["1", "2", "3"], { message: "학년을 선택해주세요" }),
  parent_phone: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, "올바른 전화번호 형식이 아닙니다"),
});

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;

// 프로필 수정 스키마
export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  school: z.string().optional(),
  grade: z.number().min(1).max(3).optional(),
  parent_phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Staff 로그인 스키마
// 비밀번호 길이 검증은 여기서 하지 않음 (초기 비밀번호 "1234" 허용)
// 비밀번호 강도 검증은 changePasswordSchema에서 수행
export const staffLoginSchema = z.object({
  username: z.string().min(3, "아이디는 3자 이상 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export type StaffLoginInput = z.infer<typeof staffLoginSchema>;

// 비밀번호 변경 스키마
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "현재 비밀번호를 입력해주세요"),
    newPassword: z.string().min(8, "새 비밀번호는 8자 이상이어야 합니다"),
    confirmPassword: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "새 비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ─────────────────────────────────────────────
// 서비스 결과 타입
// ─────────────────────────────────────────────

export interface UserServiceResult {
  success: boolean;
  profile?: Profile;
  error?: string;
}

