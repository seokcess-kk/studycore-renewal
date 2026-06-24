import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { submitConsultation } from "@/domains/consultation/service";
import {
  consultationFormSchema,
  type ConsultationFormInput,
} from "@/domains/consultation/model";
import { checkRateLimitDB, CONSULT_RATE_LIMIT } from "@/lib/rate-limit";

/**
 * 광고 랜딩페이지 리드 수집 API (서버사이드)
 *
 * 대상: public/landing/studycore-summer-landing.html 등 광고 랜딩페이지의 리드 폼.
 * 랜딩 폼이 보내는 payload(phoneNumber / custom_data / utm_* )를 표준 상담 입력으로
 * 매핑한 뒤, 홈페이지 상담과 동일한 submitConsultation 파이프라인으로 처리한다.
 *   → consultations 테이블 저장(source/utm/marketing_consent 포함)
 *   → 관리자 알림톡(notify-consult Edge Function)
 *   → 어드민 /admin/consultations 에서 "광고 유입"으로 확인
 *
 * 같은 오리진(Next public/)에서 서빙되므로 CORS 헤더는 불필요하다.
 */

interface LandingLeadPayload {
  name?: string;
  phoneNumber?: string;
  clinic_id?: string;
  landing_page_id?: string;
  inflowUrl?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  custom_data?: {
    product?: string;
    event_period?: string;
    school?: string;
    grade?: string;
    price?: number;
    price_discounted?: number;
    price_note?: string;
    capacity?: number;
    marketing_consent?: boolean;
    fbclid?: string | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 0. Rate limiting (IP 기준, 상담 신청과 동일 정책: 1분 3회)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const rateClient = await createClient();
    const rateLimitResult = await checkRateLimitDB(
      rateClient,
      `lead:${ip}`,
      CONSULT_RATE_LIMIT
    );

    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetTime - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          success: false,
          error: "너무 많은 요청입니다. 잠시 후 다시 시도해 주세요.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.resetTime),
          },
        }
      );
    }

    // 1. 요청 본문 파싱
    const body = (await request.json()) as LandingLeadPayload;
    const cd = body.custom_data ?? {};

    // 2. 랜딩 payload → 표준 상담 입력으로 매핑
    //    광고 리드는 상담 유형을 "프로그램 문의"(program)로 고정하고,
    //    유입 경로/추적값은 source·utm 컬럼에 보존한다.
    const formInput: ConsultationFormInput = {
      name: (body.name ?? "").trim(),
      phone: (body.phoneNumber ?? "").trim(),
      school: cd.school?.trim() || undefined,
      grade: cd.grade?.trim() || undefined,
      consultType: "program",
      source: body.landing_page_id || "ad",
      utm: {
        landing_page_id: body.landing_page_id ?? null,
        inflow_url: body.inflowUrl ?? null,
        utm_source: body.utm_source ?? null,
        utm_medium: body.utm_medium ?? null,
        utm_campaign: body.utm_campaign ?? null,
        utm_content: body.utm_content ?? null,
        utm_term: body.utm_term ?? null,
        fbclid: cd.fbclid ?? null,
        product: cd.product ?? null,
      },
      marketingConsent: Boolean(cd.marketing_consent),
    };

    // 3. 유효성 검사 (이름/전화번호 형식 등)
    const validation = consultationFormSchema.safeParse(formInput);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // 4. RLS 우회 클라이언트로 저장 + 알림 발송 (비로그인 인입 허용)
    const supabase = await createAdminClient();
    const result = await submitConsultation(supabase, validation.data);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // 5. 성공 응답 (랜딩 폼은 response.ok만 확인)
    return NextResponse.json({
      success: true,
      message: "신청이 접수되었습니다.",
      consultationId: result.consultation?.id,
    });
  } catch (error) {
    console.error("리드 수집 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }
}
