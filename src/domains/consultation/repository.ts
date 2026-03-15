/**
 * Consultation 도메인 - 리포지토리
 *
 * 이 파일에는 Supabase DB 쿼리만 포함합니다.
 * ⚠️ 비즈니스 로직 금지 → service.ts
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import type { Consultation, CreateConsultationInput } from "./model";

/**
 * 상담 신청 생성
 */
export async function createConsultation(
  supabase: SupabaseClient,
  data: Omit<CreateConsultationInput, "status"> & { status: string }
): Promise<Consultation> {
  const { data: consultation, error } = await supabase
    .from("consultations")
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`상담 신청 저장 실패: ${error.message}`);
  }

  return consultation;
}

/**
 * 상담 목록 조회 (어드민용)
 */
export async function getConsultations(
  supabase: SupabaseClient,
  options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: Consultation[]; count: number }> {
  let query = supabase
    .from("consultations")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`상담 목록 조회 실패: ${error.message}`);
  }

  return { data: data || [], count: count || 0 };
}

/**
 * 상담 상세 조회
 */
export async function getConsultationById(
  supabase: SupabaseClient,
  id: string
): Promise<Consultation | null> {
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // 레코드 없음
    }
    throw new Error(`상담 조회 실패: ${error.message}`);
  }

  return data;
}

/**
 * 상담 상태 업데이트
 */
export async function updateConsultationStatus(
  supabase: SupabaseClient,
  id: string,
  status: string
): Promise<Consultation> {
  const { data, error } = await supabase
    .from("consultations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`상담 상태 업데이트 실패: ${error.message}`);
  }

  return data;
}
