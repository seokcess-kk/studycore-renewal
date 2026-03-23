import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  PROTECTED_ROUTES,
  ADMIN_ROUTES,
  ASSISTANT_ROUTES,
  ROUTES,
  USER_STATUS,
  hasAdminAccess,
  isStaffRole,
  isStudent,
} from "@/lib/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 세션 업데이트 및 유저 정보 가져오기
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // 공개 라우트는 통과
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isAssistantRoute = ASSISTANT_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // 상태 안내 페이지 접근 제어 (서버 판정)
  const isStatusPage =
    pathname === "/pending-approval" || pathname === "/account-inactive";

  if (isStatusPage) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.LOGIN;
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    // 상태 불일치 시 홈으로 리다이렉트
    if (pathname === "/pending-approval" && profile?.status !== "pending") {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.HOME;
      return NextResponse.redirect(url);
    }
    if (pathname === "/account-inactive" && profile?.status !== "inactive") {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.HOME;
      return NextResponse.redirect(url);
    }

    // 상태 일치 — 페이지 표시 허용
    return supabaseResponse;
  }

  // 보호된 라우트 접근 시 로그인 확인
  if (isProtectedRoute || isAdminRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.LOGIN;
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // 유저 프로필 조회 (역할, 상태, 연락처)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, status, phone")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      // 프로필 조회 실패 — 클라이언트에서 처리하도록 통과
      return supabaseResponse;
    }

    // 어드민 라우트 접근 시 admin 또는 mentor 역할 확인
    if (isAdminRoute && !isAssistantRoute) {
      if (!hasAdminAccess(profile.role)) {
        const url = request.nextUrl.clone();
        url.pathname = ROUTES.HOME;
        return NextResponse.redirect(url);
      }
    }

    // 조교 온보딩 라우트 접근 시 assistant, mentor 또는 admin 역할 확인
    if (isAssistantRoute) {
      if (!isStaffRole(profile.role)) {
        const url = request.nextUrl.clone();
        url.pathname = ROUTES.HOME;
        return NextResponse.redirect(url);
      }
    }

    // 재원생 전용 라우트: staff가 직접 접근 시 차단
    const studentOnlyRoutes = ["/meal", "/reviews/write", "/questions/new"];
    if (studentOnlyRoutes.some((r) => pathname.startsWith(r)) && isStaffRole(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = hasAdminAccess(profile.role) ? ROUTES.ADMIN : ROUTES.HOME;
      return NextResponse.redirect(url);
    }

    // 스태프 전용 라우트: 학생 접근 시 차단
    if (pathname.startsWith("/guide") && isStudent(profile.role)) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.HOME;
      return NextResponse.redirect(url);
    }

    // 재원생 기능 페이지 접근 시 상태 확인
    if (isProtectedRoute && isStudent(profile.role)) {
      if (profile.status === USER_STATUS.PENDING) {
        const url = request.nextUrl.clone();
        url.pathname = "/pending-approval";
        return NextResponse.redirect(url);
      }
      if (profile.status === USER_STATUS.INACTIVE) {
        const url = request.nextUrl.clone();
        url.pathname = "/account-inactive";
        return NextResponse.redirect(url);
      }
      // 필수 정보 미입력 시 마이페이지로 (마이페이지 자체는 허용)
      if (!profile.phone && pathname !== "/my") {
        const url = request.nextUrl.clone();
        url.pathname = "/my";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 요청에 middleware 적용:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     * - public 폴더 파일
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
