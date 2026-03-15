/**
 * Counseling 도메인 - 서비스
 *
 * 비즈니스 로직
 */

import { SupabaseClient } from "@supabase/supabase-js";
import * as repository from "./repository";
import type { CreateCounselingInput, UpdateCounselingInput } from "./model";

/**
 * 학생의 상담 기록 조회
 */
export async function getStudentCounselings(
  supabase: SupabaseClient,
  studentId: string
) {
  return repository.getCounselingsByStudent(supabase, studentId);
}

/**
 * 상담 기록 상세 조회
 */
export async function getCounselingDetail(
  supabase: SupabaseClient,
  id: string
) {
  return repository.getCounselingById(supabase, id);
}

/**
 * 상담 기록 작성
 */
export async function recordCounseling(
  supabase: SupabaseClient,
  counselorId: string,
  input: CreateCounselingInput
) {
  return repository.createCounseling(supabase, {
    ...input,
    counselor_id: counselorId,
  });
}

/**
 * 상담 기록 수정
 */
export async function updateCounselingRecord(
  supabase: SupabaseClient,
  id: string,
  input: UpdateCounselingInput
) {
  return repository.updateCounseling(supabase, id, input);
}

/**
 * 상담 기록 삭제
 */
export async function deleteCounselingRecord(
  supabase: SupabaseClient,
  id: string
) {
  return repository.deleteCounseling(supabase, id);
}

/**
 * 대시보드용 최근 상담 기록
 */
export async function getRecentCounselingsForDashboard(
  supabase: SupabaseClient,
  limit: number = 5
) {
  return repository.getRecentCounselings(supabase, limit);
}
