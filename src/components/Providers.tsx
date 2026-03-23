"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { ToastProvider, SessionWarning, useToast } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import { logger } from "@/lib/logger";

/**
 * AuthInitializer - Supabase 세션 검증 및 동기화
 *
 * Zustand store는 sessionStorage에 persist되므로
 * 페이지 리로드 시 즉시 복원됩니다.
 *
 * 이 컴포넌트는 "복원"이 아니라 "검증" 역할만 합니다:
 * - persist된 store 상태와 Supabase 세션이 일치하는지 확인
 * - 세션 만료/변경 시 store를 갱신
 * - SIGNED_OUT 이벤트 시 store 초기화
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setLoading = useUserStore((state) => state.setLoading);
  const login = useUserStore((state) => state.login);
  const logout = useUserStore((state) => state.logout);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch (error) {
      logger.exception(error, "AuthInitializer");
      setLoading(false);
      return;
    }

    let mounted = true;

    // Supabase 세션으로 store 검증/동기화
    const syncWithSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!mounted) return;

        if (!user) {
          // 세션 없음 — persist된 store가 있어도 초기화
          const state = useUserStore.getState();
          if (state.isAuthenticated) {
            logout();
          }
          setLoading(false);
          return;
        }

        // 세션 있음 — persist된 store에 동일 유저가 있으면 검증 완료
        const state = useUserStore.getState();
        if (
          state.isAuthenticated &&
          state.user?.id === user.id &&
          state.user?.email === (user.email || "") &&
          state.profile?.role
        ) {
          setLoading(false);
          return;
        }

        // persist된 store가 없거나 유저 불일치 — DB에서 프로필 조회
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;

        if (profile) {
          login(
            { id: user.id, email: user.email || "" },
            profile
          );
        } else {
          setLoading(false);
        }
      } catch (error) {
        logger.exception(error, "AuthInitializer.syncWithSession");
        if (mounted) setLoading(false);
      }
    };

    // 초기 동기화
    syncWithSession();

    // 인증 상태 변경 리스너 (로그아웃, 토큰 갱신 등)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (!mounted) return;

        if (event === "SIGNED_OUT") {
          logout();
        } else if (event === "TOKEN_REFRESHED") {
          // 토큰 갱신 시 store 유지 (재조회 불필요)
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

/**
 * 인증 후 URL 파라미터 기반 토스트 알림
 * - ?signup=complete → 가입 신청 완료 알림
 * - ?complete-profile=true → 프로필 완성 안내
 */
function AuthToastHandler() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { success, info } = useToast();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    if (searchParams.get("signup") === "complete" && pathname === "/") {
      handled.current = true;
      success("가입 신청이 완료되었습니다. 관리자 승인을 기다려 주세요.");
      window.history.replaceState({}, "", "/");
    }

    if (searchParams.get("complete-profile") === "true" && pathname === "/my") {
      handled.current = true;
      info("연락처, 학교/학년 정보를 입력해 주세요.");
      window.history.replaceState({}, "", "/my");
    }
  }, [searchParams, pathname, success, info]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthInitializer>
        {children}
        <Suspense><AuthToastHandler /></Suspense>
        <SessionWarning />
      </AuthInitializer>
    </ToastProvider>
  );
}
