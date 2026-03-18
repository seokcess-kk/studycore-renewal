/**
 * Meal 도메인 - 서비스
 *
 * 이 파일에는 비즈니스 로직만 포함합니다.
 * ⚠️ DB 쿼리 금지 → repository.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import * as repository from "./repository";
import {
  type MealPeriod,
  type MealPeriodServiceResult,
  type MealPeriodListResult,
  type MealApplicationServiceResult,
  type MealApplicationListResult,
  type CreateMealPeriodInput,
  type UpdateMealPeriodInput,
  type MealSelections,
  type MealApplicationWithStudent,
  MEAL_TYPE_LABELS,
  WEEKDAY_LABELS,
} from "./model";

// ─────────────────────────────────────────────
// 유틸리티
// ─────────────────────────────────────────────

/**
 * 타임존 안전한 오늘 날짜 (YYYY-MM-DD)
 */
function getLocalToday(): string {
  return new Date().toLocaleDateString("en-CA");
}

// ─────────────────────────────────────────────
// 기간 관련 서비스
// ─────────────────────────────────────────────

/**
 * 현재 활성 기간 조회
 */
export async function getCurrentPeriod(
  supabase: SupabaseClient
): Promise<MealPeriodServiceResult> {
  try {
    const period = await repository.getActivePeriod(supabase);

    if (!period) {
      return {
        success: false,
        error: "현재 활성화된 도시락 신청 기간이 없습니다.",
      };
    }

    return {
      success: true,
      period,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 모든 기간 목록 조회
 */
export async function getPeriodList(
  supabase: SupabaseClient,
  options?: { activeOnly?: boolean }
): Promise<MealPeriodListResult> {
  try {
    const periods = await repository.getAllPeriods(supabase, options);

    return {
      success: true,
      periods,
    };
  } catch (error) {
    return {
      success: false,
      periods: [],
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 기간 상세 조회
 */
export async function getPeriodById(
  supabase: SupabaseClient,
  periodId: string
): Promise<MealPeriodServiceResult> {
  try {
    const period = await repository.getPeriodById(supabase, periodId);

    if (!period) {
      return {
        success: false,
        error: "기간을 찾을 수 없습니다.",
      };
    }

    return {
      success: true,
      period,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 기간 생성
 */
export async function createPeriod(
  supabase: SupabaseClient,
  input: CreateMealPeriodInput
): Promise<MealPeriodServiceResult> {
  try {
    // 접수 기간 유효성 검사
    if (new Date(input.apply_start_date) > new Date(input.apply_end_date)) {
      return {
        success: false,
        error: "접수 시작일은 접수 종료일보다 이전이어야 합니다.",
      };
    }

    // 도시락 기간 유효성 검사
    if (new Date(input.start_date) > new Date(input.end_date)) {
      return {
        success: false,
        error: "도시락 시작일은 도시락 종료일보다 이전이어야 합니다.",
      };
    }

    const period = await repository.createPeriod(supabase, input);

    return {
      success: true,
      period,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 기간 수정
 */
export async function updatePeriod(
  supabase: SupabaseClient,
  periodId: string,
  input: UpdateMealPeriodInput
): Promise<MealPeriodServiceResult> {
  try {
    // 접수 기간 유효성 검사
    if (
      input.apply_start_date &&
      input.apply_end_date &&
      new Date(input.apply_start_date) > new Date(input.apply_end_date)
    ) {
      return {
        success: false,
        error: "접수 시작일은 접수 종료일보다 이전이어야 합니다.",
      };
    }

    // 도시락 기간 유효성 검사
    if (
      input.start_date &&
      input.end_date &&
      new Date(input.start_date) > new Date(input.end_date)
    ) {
      return {
        success: false,
        error: "도시락 시작일은 도시락 종료일보다 이전이어야 합니다.",
      };
    }

    const period = await repository.updatePeriod(supabase, periodId, input);

    return {
      success: true,
      period,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 기간 삭제
 */
export async function deletePeriod(
  supabase: SupabaseClient,
  periodId: string
): Promise<MealPeriodServiceResult> {
  try {
    await repository.deletePeriod(supabase, periodId);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

// ─────────────────────────────────────────────
// 신청 관련 서비스
// ─────────────────────────────────────────────

/**
 * 도시락 신청 제출
 */
export async function submitApplication(
  supabase: SupabaseClient,
  periodId: string,
  studentId: string,
  selections: MealSelections
): Promise<MealApplicationServiceResult> {
  try {
    // 기간 유효성 검사
    const period = await repository.getPeriodById(supabase, periodId);
    if (!period) {
      return {
        success: false,
        error: "신청 기간을 찾을 수 없습니다.",
      };
    }

    if (!period.is_active) {
      return {
        success: false,
        error: "현재 신청 가능한 기간이 아닙니다.",
      };
    }

    const today = getLocalToday();
    if (today < period.apply_start_date || today > period.apply_end_date) {
      return {
        success: false,
        error: "접수 기간이 아닙니다.",
      };
    }

    const application = await repository.upsertApplication(
      supabase,
      periodId,
      studentId,
      selections
    );

    return {
      success: true,
      application,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 학생의 현재 기간 신청 조회
 */
export async function getStudentMealPlan(
  supabase: SupabaseClient,
  studentId: string
): Promise<MealApplicationServiceResult & { period?: MealPeriod }> {
  try {
    // 현재 활성 기간 조회
    const period = await repository.getActivePeriod(supabase);

    if (!period) {
      return {
        success: false,
        error: "현재 활성화된 신청 기간이 없습니다.",
      };
    }

    // 학생의 신청 조회
    const application = await repository.getStudentApplication(
      supabase,
      period.id,
      studentId
    );

    return {
      success: true,
      application: application || undefined,
      period,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 기간별 신청 현황 조회 (어드민용)
 */
export async function getApplicationsByPeriod(
  supabase: SupabaseClient,
  periodId: string
): Promise<MealApplicationListResult> {
  try {
    const applications = await repository.getApplicationsByPeriod(
      supabase,
      periodId
    );

    return {
      success: true,
      applications,
      total: applications.length,
    };
  } catch (error) {
    return {
      success: false,
      applications: [],
      total: 0,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

/**
 * 활성 재원생 목록 조회 (미신청자 비교용)
 */
export async function getActiveStudents(
  supabase: SupabaseClient
): Promise<{
  success: boolean;
  students: {
    id: string;
    name: string;
    school: string | null;
    grade: number | null;
  }[];
  error?: string;
}> {
  try {
    const students = await repository.getActiveStudents(supabase);
    return { success: true, students };
  } catch (error) {
    return {
      success: false,
      students: [],
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
  }
}

// ─────────────────────────────────────────────
// 엑셀 내보내기
// ─────────────────────────────────────────────

/**
 * 엑셀 내보내기용 데이터 생성
 */
export function generateExcelData(
  period: MealPeriod,
  applications: MealApplicationWithStudent[]
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  for (const app of applications) {
    const selections = app.selections as Record<string, string[]>;
    const studentName = app.student?.name || "알 수 없음";
    const school = app.student?.school || "";
    const grade = app.student?.grade ? `${app.student.grade}학년` : "";

    if (period.selection_type === "weekday") {
      // 요일별 선택
      for (const [weekday, meals] of Object.entries(selections)) {
        const weekdayLabel = WEEKDAY_LABELS[parseInt(weekday)] || weekday;
        for (const meal of meals) {
          rows.push({
            이름: studentName,
            학교: school,
            학년: grade,
            요일: weekdayLabel,
            식사: MEAL_TYPE_LABELS[meal as keyof typeof MEAL_TYPE_LABELS] || meal,
          });
        }
      }
    } else {
      // 날짜별 선택
      for (const [date, meals] of Object.entries(selections)) {
        for (const meal of meals) {
          rows.push({
            이름: studentName,
            학교: school,
            학년: grade,
            날짜: date,
            식사: MEAL_TYPE_LABELS[meal as keyof typeof MEAL_TYPE_LABELS] || meal,
          });
        }
      }
    }
  }

  return rows;
}

/**
 * 신청 현황 요약 생성
 */
export function generateSummary(
  period: MealPeriod,
  applications: MealApplicationWithStudent[]
): { label: string; lunch: number; dinner: number }[] {
  const summary: Record<string, { lunch: number; dinner: number }> = {};

  for (const app of applications) {
    const selections = app.selections as Record<string, string[]>;

    for (const [key, meals] of Object.entries(selections)) {
      if (!summary[key]) {
        summary[key] = { lunch: 0, dinner: 0 };
      }

      for (const meal of meals) {
        if (meal === "lunch") summary[key].lunch++;
        if (meal === "dinner") summary[key].dinner++;
      }
    }
  }

  return Object.entries(summary)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, counts]) => ({
      label:
        period.selection_type === "weekday"
          ? WEEKDAY_LABELS[parseInt(key)] || key
          : key,
      ...counts,
    }));
}
