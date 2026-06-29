import crypto from "node:crypto";
import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import {
  submitConsultation,
  notifyConsultationCreated,
} from "@/domains/consultation/service";
import {
  consultationFormSchema,
  type ConsultationFormInput,
} from "@/domains/consultation/model";
import {
  extractFbpFbcFromCookieHeader,
  sendMetaLeadEvent,
} from "@/lib/meta/capi";
import { checkRateLimitDB, CONSULT_RATE_LIMIT } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 0. Rate Limiting (Supabase 테이블 기반)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const rateClient = await createClient();
    const rateLimitResult = await checkRateLimitDB(
      rateClient,
      `consult:${ip}`,
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
    const body = await request.json();

    // 2. 유효성 검사
    const validationResult = consultationFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const formData: ConsultationFormInput = validationResult.data;

    // 3. Supabase Admin 클라이언트 (RLS 우회 — 비로그인 상담 신청 허용)
    const supabase = await createAdminClient();

    // 4. 상담 신청 처리 (DB 저장). 알림은 응답 후 처리(deferNotify).
    const result = await submitConsultation(supabase, formData, {
      deferNotify: true,
    });

    if (!result.success || !result.consultation) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    // 5. 알림톡/SMS(Edge Function) + Meta CAPI는 사용자 응답을 막지 않도록 백그라운드(after)로 처리.
    //    같은 event_id를 클라이언트 픽셀과 공유해 중복 제거.
    //    (헤더 파생값은 응답 반환 전에 미리 추출해 클로저로 캡처한다.)
    const consultation = result.consultation;
    const eventId = crypto.randomUUID();
    const { fbp, fbc } = extractFbpFbcFromCookieHeader(
      request.headers.get("cookie")
    );
    const userAgent = request.headers.get("user-agent") ?? undefined;
    const referer = request.headers.get("referer");
    const origin = request.headers.get("origin");
    const fallbackBase =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://studycore.kr";
    const eventSourceUrl = referer ?? `${origin ?? fallbackBase}/consult`;

    after(async () => {
      await notifyConsultationCreated(consultation);
      await sendMetaLeadEvent({
        eventId,
        eventSourceUrl,
        user: {
          firstName: formData.name,
          phone: formData.phone,
          country: "kr",
          externalId: formData.phone.replace(/\D/g, ""),
          ip: ip !== "unknown" ? ip : undefined,
          userAgent,
          fbp,
          fbc,
        },
      });
    });

    // 6. 성공 응답
    return NextResponse.json({
      success: true,
      message: "상담 신청이 완료되었습니다.",
      consultationId: consultation.id,
      eventId,
    });
  } catch (error) {
    console.error("상담 신청 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 }
    );
  }
}
