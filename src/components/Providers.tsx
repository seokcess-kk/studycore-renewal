"use client";

import { useEffect, useRef } from "react";
import { ToastProvider, SessionWarning } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import { logger } from "@/lib/logger";
import type { Session } from "@supabase/supabase-js";

/**
 * AuthInitializer - 비블로킹 인증 초기화
 *
 * 앱을 블로킹하지 않고 백그라운드에서 인증 상태를 확인합니다.
 * children은 즉시 렌더링되고, 인증 상태는 비동기로 업데이트됩니다.
 *
 * Race Condition 방지:
 * - AbortController로 진행 중인 비동기 작업 취소
 * - mounted 플래그로 unmount 후 상태 업데이트 방지
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((state) => state.setUser);
  const setProfile = useUserStore((state) => state.setProfile);
  const setLoading = useUserStore((state) => state.setLoading);
  const initialized = useRef(false);

  useEffect(() => {
    // 이미 초기화되었으면 스킵
    if (initialized.current) return;
    initialized.current = true;

    // AbortController로 비동기 작업 취소 관리
    const abortController = new AbortController();

    let supabase: ReturnType<typeof createClient>;

    try {
      supabase = createClient();
    } catch (error) {
      logger.exception(error, "AuthInitializer");
      setLoading(false);
      return;
    }

    let mounted = true;
    let initialSessionHandled = false;

    // 세션 처리 함수 (중복 호출 방지)
    const handleSession = async (session: Session | null, isInitial = false) => {
      // unmount 또는 abort 시 중단
      if (!mounted || abortController.signal.aborted) return;

      // 초기 세션은 한 번만 처리
      if (isInitial && initialSessionHandled) return;
      if (isInitial) initialSessionHandled = true;

      if (session?.user) {
        // 상태 업데이트 전 다시 확인
        if (!mounted || abortController.signal.aborted) return;

        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });

        // 프로필 조회
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          // 비동기 작업 후 다시 확인
          if (mounted && !abortController.signal.aborted) {
            setProfile(profile || null);
          }
        } catch (error) {
          logger.exception(error, "ProfileFetch");
          if (mounted && !abortController.signal.aborted) {
            setProfile(null);
          }
        }
      } else {
        if (mounted && !abortController.signal.aborted) {
          setUser(null);
          setProfile(null);
        }
      }

      if (mounted && !abortController.signal.aborted) {
        setLoading(false);
      }
    };

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || abortController.signal.aborted) return;

      // INITIAL_SESSION 이벤트로 초기 세션 처리
      if (event === "INITIAL_SESSION") {
        await handleSession(session, true);
        return;
      }

      // 그 외 이벤트 (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED 등)
      await handleSession(session);
    });

    // fallback: INITIAL_SESSION이 오지 않는 경우를 대비
    const fallbackTimeout = setTimeout(() => {
      if (!initialSessionHandled && mounted && !abortController.signal.aborted) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          handleSession(session, true);
        });
      }
    }, 1000);

    return () => {
      mounted = false;
      abortController.abort(); // 진행 중인 비동기 작업 취소 신호
      clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 비블로킹: children 즉시 렌더링
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthInitializer>
        {children}
        <SessionWarning />
      </AuthInitializer>
    </ToastProvider>
  );
}
