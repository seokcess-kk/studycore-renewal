/**
 * Counseling 도메인 - 리포지토리
 *
 * Supabase DB 쿼리
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  CounselingRecord,
  CounselingRecordWithProfiles,
  CreateCounselingInput,
  UpdateCounselingInput,
} from "./model";

/**
 * 학생별 상담 기록 조회
 */
export async function getCounselingsByStudent(
  supabase: SupabaseClient,
  studentId: string
): Promise<CounselingRecordWithProfiles[]> {
  const { data, error } = await supabase
    .from("counseling_records")
    .select(
      `
      *,
      student:profiles!student_id (
        name,
        school,
        grade
      ),
      counselor:profiles!counselor_id (
        name
      )
    `
    )
    .eq("student_id", studentId)
    .order("date", { ascending: false });

  if (error) {
    throw new Error(`상담 기록 조회 실패: ${error.message}`);
  }

  // Supabase 조인 결과 타입 캐스팅
  return (data || []).map((record) => ({
    ...record,
    student: record.student as unknown as CounselingRecordWithProfiles["student"],
    counselor: record.counselor as unknown as CounselingRecordWithProfiles["counselor"],
  }));
}

/**
 * 상담 기록 상세 조회
 */
export async function getCounselingById(
  supabase: SupabaseClient,
  id: string
): Promise<CounselingRecordWithProfiles | null> {
  const { data, error } = await supabase
    .from("counseling_records")
    .select(
      `
      *,
      student:profiles!student_id (
        name,
        school,
        grade
      ),
      counselor:profiles!counselor_id (
        name
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    throw new Error(`상담 기록 조회 실패: ${error.message}`);
  }

  // Supabase 조인 결과 타입 캐스팅
  return {
    ...data,
    student: data.student as unknown as CounselingRecordWithProfiles["student"],
    counselor: data.counselor as unknown as CounselingRecordWithProfiles["counselor"],
  };
}

/**
 * 상담 기록 생성
 */
export async function createCounseling(
  supabase: SupabaseClient,
  data: CreateCounselingInput & { counselor_id: string }
): Promise<CounselingRecord> {
  const { data: record, error } = await supabase
    .from("counseling_records")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`상담 기록 생성 실패: ${error.message}`);
  }

  return record;
}

/**
 * 상담 기록 수정
 */
export async function updateCounseling(
  supabase: SupabaseClient,
  id: string,
  data: UpdateCounselingInput
): Promise<CounselingRecord> {
  const { data: record, error } = await supabase
    .from("counseling_records")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`상담 기록 수정 실패: ${error.message}`);
  }

  return record;
}

/**
 * 상담 기록 삭제
 */
export async function deleteCounseling(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("counseling_records")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`상담 기록 삭제 실패: ${error.message}`);
  }
}

/**
 * 최근 상담 기록 조회 (대시보드용)
 */
export async function getRecentCounselings(
  supabase: SupabaseClient,
  limit: number = 5
): Promise<CounselingRecordWithProfiles[]> {
  const { data, error } = await supabase
    .from("counseling_records")
    .select(
      `
      *,
      student:profiles!student_id (
        name,
        school,
        grade
      ),
      counselor:profiles!counselor_id (
        name
      )
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`최근 상담 기록 조회 실패: ${error.message}`);
  }

  // Supabase 조인 결과 타입 캐스팅
  return (data || []).map((record) => ({
    ...record,
    student: record.student as unknown as CounselingRecordWithProfiles["student"],
    counselor: record.counselor as unknown as CounselingRecordWithProfiles["counselor"],
  }));
}
