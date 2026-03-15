import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { submitConsultation } from "@/domains/consultation/service";
import {
  consultationFormSchema,
  type ConsultationFormInput,
} from "@/domains/consultation/model";
import { checkRateLimit, CONSULT_RATE_LIMIT } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // 0. Rate Limiting 체크
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() || "unknown";
    const rateLimitResult = checkRateLimit(`consult:${ip}`, CONSULT_RATE_LIMIT);

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

    // 3. Supabase 클라이언트 생성
    const supabase = await createClient();

    // 4. 상담 신청 처리
    const result = await submitConsultation(supabase, formData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }

    // 5. 성공 응답
    return NextResponse.json({
      success: true,
      message: "상담 신청이 완료되었습니다.",
      consultationId: result.consultation?.id,
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
