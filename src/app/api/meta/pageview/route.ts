import { NextRequest } from "next/server";
import {
  extractFbpFbcFromCookieHeader,
  sendMetaPageViewEvent,
} from "@/lib/meta/capi";

/**
 * Meta CAPI PageView 수집 API (서버사이드)
 *
 * 배경: 브라우저 픽셀은 모든 방문에서 PageView를 발사하지만 서버 CAPI는 그동안
 * Lead만 보내, "CAPI가 픽셀보다 이벤트가 적다"는 커버리지 격차가 발생했다.
 * 이 엔드포인트는 클라이언트가 생성한 event_id를 받아 같은 id로 서버 PageView를
 * 전송한다 → 브라우저 픽셀 PageView와 event_id 기준 중복 제거.
 *
 * event_id를 클라이언트가 생성하는 이유: 랜딩 HTML이 CDN 캐시되므로 서버에서
 * id를 주입하면 모든 캐시 방문자가 같은 id를 공유해 한 건으로 합쳐진다.
 *
 * 응답 본문은 불필요(브라우저는 fire-and-forget으로 호출) → 204.
 */

interface PageViewPayload {
  eventId?: string;
  eventSourceUrl?: string;
}

/** http(s) URL만 통과 (가비지/인젝션 방지) */
function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PageViewPayload;
    const eventId = body.eventId?.trim();

    // event_id 없으면 중복 제거가 불가하므로 무시 (조용히 성공 처리)
    if (!eventId || eventId.length > 100) {
      return new Response(null, { status: 204 });
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim();
    const { fbp, fbc } = extractFbpFbcFromCookieHeader(
      request.headers.get("cookie")
    );

    const fallbackBase =
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://studycore.kr";
    const eventSourceUrl = isHttpUrl(body.eventSourceUrl)
      ? body.eventSourceUrl
      : isHttpUrl(request.headers.get("referer"))
        ? request.headers.get("referer")!
        : `${request.headers.get("origin") ?? fallbackBase}/`;

    await sendMetaPageViewEvent({
      eventId,
      eventSourceUrl,
      user: {
        ip: ip && ip !== "unknown" ? ip : undefined,
        userAgent: request.headers.get("user-agent") ?? undefined,
        fbp,
        fbc,
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("PageView 수집 API 오류:", error);
    // 추적 실패는 사용자 영향이 없으므로 조용히 성공 처리
    return new Response(null, { status: 204 });
  }
}
