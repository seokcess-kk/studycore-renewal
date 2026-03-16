/**
 * Meal 도메인 - 리포지토리
 *
 * 이 파일에는 Supabase DB 쿼리만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  MealPeriod,
  MealApplication,
  MealApplicationWithStudent,
  CreateMealPeriodInput,
  UpdateMealPeriodInput,
  MealSelections,
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
// 기간 (Period) 관련
// ─────────────────────────────────────────────

/**
 * 현재 활성 기간 조회
 */
export async function getActivePeriod(
  supabase: SupabaseClient
): Promise<MealPeriod | null> {
  const today = getLocalToday();

  const { data, error } = await supabase
    .from("lunch_periods")
    .select("*")
    .eq("is_active", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`활성 기간 조회 실패: ${error.message}`);
  }

  return data && data.length > 0 ? data[0] : null;
}

/**
 * 모든 기간 목록 조회
 */
export async function getAllPeriods(
  supabase: SupabaseClient,
  options?: {
    activeOnly?: boolean;
  }
): Promise<MealPeriod[]> {
  let query = supabase
    .from("lunch_periods")
    .select("*")
    .order("start_date", { ascending: false });

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`기간 목록 조회 실패: ${error.message}`);
  }

  return data || [];
}

/**
 * 기간 상세 조회
 */
export async function getPeriodById(
  supabase: SupabaseClient,
  periodId: string
): Promise<MealPeriod | null> {
  const { data, error } = await supabase
    .from("lunch_periods")
    .select("*")
    .eq("id", periodId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`기간 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 기간 생성
 */
export async function createPeriod(
  supabase: SupabaseClient,
  data: CreateMealPeriodInput
): Promise<MealPeriod> {
  const { data: period, error } = await supabase
    .from("lunch_periods")
    .insert({
      ...data,
      available_options: data.available_options || {},
    })
    .select()
    .single();

  if (error) {
    throw new Error(`기간 생성 실패: ${error.message}`);
  }

  return period;
}

/**
 * 기간 수정
 */
export async function updatePeriod(
  supabase: SupabaseClient,
  periodId: string,
  data: UpdateMealPeriodInput
): Promise<MealPeriod> {
  const { data: period, error } = await supabase
    .from("lunch_periods")
    .update(data)
    .eq("id", periodId)
    .select()
    .single();

  if (error) {
    throw new Error(`기간 수정 실패: ${error.message}`);
  }

  return period;
}

/**
 * 기간 삭제
 */
export async function deletePeriod(
  supabase: SupabaseClient,
  periodId: string
): Promise<void> {
  const { error } = await supabase
    .from("lunch_periods")
    .delete()
    .eq("id", periodId);

  if (error) {
    throw new Error(`기간 삭제 실패: ${error.message}`);
  }
}

// ─────────────────────────────────────────────
// 신청 (Application) 관련
// ─────────────────────────────────────────────

/**
 * 기간별 모든 신청 조회 (어드민용)
 */
export async function getApplicationsByPeriod(
  supabase: SupabaseClient,
  periodId: string
): Promise<MealApplicationWithStudent[]> {
  const { data, error } = await supabase
    .from("lunch_applications")
    .select(
      `
      *,
      student:profiles!student_id (
        name,
        school,
        grade
      )
    `
    )
    .eq("period_id", periodId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`신청 목록 조회 실패: ${error.message}`);
  }

  // Supabase 조인 타입 캐스팅
  return (data || []).map((app) => ({
    ...app,
    student: app.student as unknown as MealApplicationWithStudent["student"],
  }));
}

/**
 * 학생의 특정 기간 신청 조회
 */
export async function getStudentApplication(
  supabase: SupabaseClient,
  periodId: string,
  studentId: string
): Promise<MealApplication | null> {
  const { data, error } = await supabase
    .from("lunch_applications")
    .select("*")
    .eq("period_id", periodId)
    .eq("student_id", studentId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`신청 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 신청 생성 또는 수정 (Upsert)
 */
export async function upsertApplication(
  supabase: SupabaseClient,
  periodId: string,
  studentId: string,
  selections: MealSelections
): Promise<MealApplication> {
  const { data, error } = await supabase
    .from("lunch_applications")
    .upsert(
      {
        period_id: periodId,
        student_id: studentId,
        selections,
      },
      {
        onConflict: "period_id,student_id",
      }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`신청 저장 실패: ${error.message}`);
  }

  return data;
}

/**
 * 신청 삭제
 */
export async function deleteApplication(
  supabase: SupabaseClient,
  applicationId: string
): Promise<void> {
  const { error } = await supabase
    .from("lunch_applications")
    .delete()
    .eq("id", applicationId);

  if (error) {
    throw new Error(`신청 삭제 실패: ${error.message}`);
  }
}

/**
 * 학생의 모든 신청 조회
 */
export async function getStudentApplications(
  supabase: SupabaseClient,
  studentId: string
): Promise<(MealApplication & { period: MealPeriod })[]> {
  const { data, error } = await supabase
    .from("lunch_applications")
    .select(
      `
      *,
      period:lunch_periods!period_id (*)
    `
    )
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`신청 목록 조회 실패: ${error.message}`);
  }

  return (data || []).map((app) => ({
    ...app,
    period: app.period as unknown as MealPeriod,
  }));
}
