/**
 * Meal 도메인 - 모델 정의
 *
 * 이 파일에는 타입과 Zod 스키마만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ DB 쿼리 금지 → repository.ts
 */

import { z } from "zod";

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────

export const SelectionType = {
  WEEKDAY: "weekday",
  DATE: "date",
} as const;

export type SelectionTypeValue =
  (typeof SelectionType)[keyof typeof SelectionType];

export const MealType = {
  LUNCH: "lunch",
  DINNER: "dinner",
} as const;

export type MealTypeValue = (typeof MealType)[keyof typeof MealType];

export const MEAL_TYPE_LABELS: Record<MealTypeValue, string> = {
  lunch: "중식",
  dinner: "석식",
};

export const WEEKDAY_LABELS: Record<number, string> = {
  0: "일",
  1: "월",
  2: "화",
  3: "수",
  4: "목",
  5: "금",
  6: "토",
};

// ─────────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────────

// 도시락 신청 기간 스키마
export const mealPeriodSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  start_date: z.string(), // DATE 형식
  end_date: z.string(),
  meal_types: z.array(z.enum(["lunch", "dinner"])),
  selection_type: z.enum(["weekday", "date"]),
  available_options: z.record(z.string(), z.unknown()), // JSONB
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type MealPeriod = z.infer<typeof mealPeriodSchema>;

// 도시락 신청 스키마
export const mealApplicationSchema = z.object({
  id: z.string().uuid(),
  period_id: z.string().uuid(),
  student_id: z.string().uuid(),
  selections: z.record(z.string(), z.unknown()), // JSONB
  created_at: z.string(),
  updated_at: z.string(),
});

export type MealApplication = z.infer<typeof mealApplicationSchema>;

// 도시락 신청 + 학생 정보
export const mealApplicationWithStudentSchema = mealApplicationSchema.extend({
  student: z
    .object({
      name: z.string(),
      school: z.string().nullable(),
      grade: z.number().nullable(),
    })
    .nullable(),
});

export type MealApplicationWithStudent = z.infer<
  typeof mealApplicationWithStudentSchema
>;

// ─────────────────────────────────────────────
// 선택 데이터 타입
// ─────────────────────────────────────────────

// 요일별 선택: { "1": ["lunch", "dinner"], "2": ["lunch"], ... }
export type WeekdaySelections = Record<string, MealTypeValue[]>;

// 날짜별 선택: { "2024-01-15": ["lunch"], "2024-01-16": ["lunch", "dinner"], ... }
export type DateSelections = Record<string, MealTypeValue[]>;

// MealSelections는 Record<string, string[]>로 사용
export type MealSelections = Record<string, string[]>;

// ─────────────────────────────────────────────
// 입력 스키마
// ─────────────────────────────────────────────

// 기간 생성 스키마
export const createMealPeriodSchema = z.object({
  title: z.string().min(2, "제목은 2자 이상 입력해주세요").max(100),
  start_date: z.string().min(1, "시작일을 선택해주세요"),
  end_date: z.string().min(1, "종료일을 선택해주세요"),
  meal_types: z.array(z.enum(["lunch", "dinner"])).min(1, "식사 유형을 선택해주세요"),
  selection_type: z.enum(["weekday", "date"]),
  available_options: z.record(z.string(), z.unknown()).optional(),
  is_active: z.boolean().optional(),
});

export type CreateMealPeriodInput = z.infer<typeof createMealPeriodSchema>;

// 기간 수정 스키마
export const updateMealPeriodSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  meal_types: z.array(z.enum(["lunch", "dinner"])).optional(),
  selection_type: z.enum(["weekday", "date"]).optional(),
  available_options: z.record(z.string(), z.unknown()).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateMealPeriodInput = z.infer<typeof updateMealPeriodSchema>;

// 신청 생성/수정 스키마
export const upsertMealApplicationSchema = z.object({
  period_id: z.string().uuid(),
  selections: z.record(z.string(), z.array(z.enum(["lunch", "dinner"]))),
});

export type UpsertMealApplicationInput = z.infer<
  typeof upsertMealApplicationSchema
>;

// ─────────────────────────────────────────────
// 서비스 결과 타입
// ─────────────────────────────────────────────

export interface MealPeriodServiceResult {
  success: boolean;
  period?: MealPeriod;
  error?: string;
}

export interface MealPeriodListResult {
  success: boolean;
  periods: MealPeriod[];
  error?: string;
}

export interface MealApplicationServiceResult {
  success: boolean;
  application?: MealApplication;
  error?: string;
}

export interface MealApplicationListResult {
  success: boolean;
  applications: MealApplicationWithStudent[];
  total: number;
  error?: string;
}

// ─────────────────────────────────────────────
// 하위 호환성 별칭 (deprecated)
// ─────────────────────────────────────────────

/** @deprecated Use MealPeriod instead */
export type LunchPeriod = MealPeriod;
/** @deprecated Use MealApplication instead */
export type LunchApplication = MealApplication;
/** @deprecated Use MealApplicationWithStudent instead */
export type LunchApplicationWithStudent = MealApplicationWithStudent;
/** @deprecated Use MealSelections instead */
export type LunchSelections = MealSelections;
/** @deprecated Use CreateMealPeriodInput instead */
export type CreateLunchPeriodInput = CreateMealPeriodInput;
/** @deprecated Use UpdateMealPeriodInput instead */
export type UpdateLunchPeriodInput = UpdateMealPeriodInput;
