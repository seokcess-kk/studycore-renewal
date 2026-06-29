/**
 * Consultation 도메인 - 서비스
 *
 * 이 파일에는 비즈니스 로직만 포함합니다.
 * ⚠️ DB 쿼리 금지 → repository.ts 경유
 * ⚠️ 타입/스키마 정의 금지 → model.ts
 */

import { SupabaseClient } from "@supabase/supabase-js";
import {
  consultationFormSchema,
  createConsultationSchema,
  type ConsultationFormInput,
  type ConsultationServiceResult,
  type Consultation,
} from "./model";
import * as consultationRepo from "./repository";

/**
 * 상담 신청 처리
 *
 * 1. 폼 데이터 유효성 검사
 * 2. DB에 상담 신청 저장
 * 3. (deferNotify=false일 때) Edge Function(notify-consult)으로 알림 발송
 *
 * @param options.deferNotify true면 알림 발송을 건너뛴다. 알림톡/SMS Edge Function은
 *   콜드스타트+외부 API로 수 초가 걸려 사용자 응답을 지연시키므로, Route Handler에서
 *   `after()`로 응답 후 `notifyConsultationCreated()`를 직접 호출하기 위한 옵션이다.
 */
export async function submitConsultation(
  supabase: SupabaseClient,
  formData: ConsultationFormInput,
  options?: { deferNotify?: boolean }
): Promise<ConsultationServiceResult> {
  try {
    // 1. 유효성 검사
    const validationResult = consultationFormSchema.safeParse(formData);
    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.issues[0].message,
      };
    }

    // 2. 데이터 변환
    const createData = createConsultationSchema.parse(formData);

    // 3. DB 저장
    const consultation = await consultationRepo.createConsultation(
      supabase,
      createData
    );

    // 4. 알림 발송 (deferNotify면 호출측이 백그라운드로 처리)
    if (!options?.deferNotify) {
      await notifyConsultationCreated(consultation);
    }

    return { success: true, consultation };
  } catch (error) {
    console.error("상담 신청 처리 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "상담 신청 처리 중 오류가 발생했습니다",
    };
  }
}

/**
 * 상담 신청 알림 발송 (notify-consult Edge Function — 관리자 알림톡 + 신청자 SMS)
 *
 * DB 저장과 분리해 별도 호출 가능. 알림은 사용자 응답을 막을 필요가 없으므로
 * Route Handler에서 `after()`로 응답 후 백그라운드 실행하는 것을 권장한다.
 * 모든 오류를 내부에서 잡아 throw하지 않는다(베스트-에포트 — 신청 자체는 이미 성공).
 */
export async function notifyConsultationCreated(
  consultation: Consultation
): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) return;

    const response = await fetch(`${supabaseUrl}/functions/v1/notify-consult`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        name: consultation.name,
        phone: consultation.phone,
        // 알림톡 "학교학년" 변수에 학교+학년을 함께 노출
        school:
          [consultation.school, consultation.grade]
            .filter(Boolean)
            .join(" ") || null,
        consultType: consultation.consult_type,
        message: consultation.message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("상담 알림 발송 실패:", response.status, errorData);
    }
  } catch (notifyError) {
    // 네트워크 에러 등 — 상담 신청 자체를 실패 처리하지 않음
    console.error("상담 알림 발송 실패:", notifyError);
  }
}

/**
 * 상담 목록 조회 (어드민용)
 */
export async function getConsultationList(
  supabase: SupabaseClient,
  options?: {
    status?: string;
    source?: "homepage" | "ad";
    page?: number;
    pageSize?: number;
  }
): Promise<{
  consultations: Consultation[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 10;
  const offset = (page - 1) * pageSize;

  const { data, count } = await consultationRepo.getConsultations(supabase, {
    status: options?.status,
    source: options?.source,
    limit: pageSize,
    offset,
  });

  return {
    consultations: data,
    total: count,
    page,
    pageSize,
  };
}

/**
 * 상담 상태 변경 (어드민용)
 */
export async function changeConsultationStatus(
  supabase: SupabaseClient,
  consultationId: string,
  newStatus: "new" | "contacted" | "done"
): Promise<ConsultationServiceResult> {
  try {
    const consultation = await consultationRepo.updateConsultationStatus(
      supabase,
      consultationId,
      newStatus
    );

    return { success: true, consultation };
  } catch (error) {
    console.error("상담 상태 변경 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "상담 상태 변경 중 오류가 발생했습니다",
    };
  }
}

/**
 * 상담 삭제 (어드민용)
 */
export async function deleteConsultation(
  supabase: SupabaseClient,
  consultationId: string
): Promise<ConsultationServiceResult> {
  try {
    await consultationRepo.deleteConsultation(supabase, consultationId);
    return { success: true };
  } catch (error) {
    console.error("상담 삭제 실패:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "상담 삭제 중 오류가 발생했습니다",
    };
  }
}
