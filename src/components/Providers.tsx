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
 * 최적화: login() 액션으로 이미 store에 프로필이 설정된 경우
 * DB 재조회를 스킵하여 메뉴 깜빡임을 방지합니다.
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((state) => state.setUser);
  const setProfile = useUserStore((state) => state.setProfile);
  const setLoading = useUserStore((state) => state.setLoading);
  const logout = useUserStore((state) => state.logout);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

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

    // 프로필 조회 (재시도 1회)
    const fetchProfile = async (userId: string, retry = true): Promise<Record<string, unknown> | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        logger.warn("프로필 조회 실패", {
          context: "AuthInitializer",
          data: { userId, error: error.message, willRetry: retry },
        });
        // 1회 재시도
        if (retry && mounted && !abortController.signal.aborted) {
          await new Promise((r) => setTimeout(r, 500));
          return fetchProfile(userId, false);
        }
        return null;
      }

      return data;
    };

    const handleSession = async (session: Session | null, isInitial = false) => {
      if (!mounted || abortController.signal.aborted) return;

      if (isInitial && initialSessionHandled) return;
      if (isInitial) initialSessionHandled = true;

      if (session?.user) {
        if (!mounted || abortController.signal.aborted) return;

        // 이미 store에 동일 유저의 프로필이 있으면 DB 재조회 스킵
        const currentState = useUserStore.getState();
        if (
          currentState.isAuthenticated &&
          currentState.user?.id === session.user.id &&
          currentState.profile?.role
        ) {
          setLoading(false);
          return;
        }

        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });

        try {
          const profile = await fetchProfile(session.user.id);

          if (mounted && !abortController.signal.aborted) {
            if (profile) {
              logger.debug("프로필 로드 완료", {
                context: "AuthInitializer",
                data: { role: (profile as Record<string, unknown>).role },
              });
            }
            setProfile((profile as Parameters<typeof setProfile>[0]) || null);
          }
        } catch (error) {
          logger.exception(error, "ProfileFetch");
          if (mounted && !abortController.signal.aborted) {
            setProfile(null);
          }
        }
      } else {
        if (mounted && !abortController.signal.aborted) {
          logout();
        }
      }

      if (mounted && !abortController.signal.aborted) {
        setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || abortController.signal.aborted) return;

      if (event === "INITIAL_SESSION") {
        await handleSession(session, true);
        return;
      }

      // SIGNED_IN 이벤트: store에 이미 프로필이 있으면 스킵
      if (event === "SIGNED_IN") {
        const currentState = useUserStore.getState();
        if (currentState.isAuthenticated && currentState.profile?.role) {
          setLoading(false);
          return;
        }
      }

      await handleSession(session);
    });

    // fallback: INITIAL_SESSION이 오지 않는 경우
    const fallbackTimeout = setTimeout(() => {
      if (!initialSessionHandled && mounted && !abortController.signal.aborted) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          handleSession(session, true);
        });
      }
    }, 1000);

    // 안전 타임아웃: 3초 내 로딩 완료되지 않으면 강제 해제
    const safetyTimeout = setTimeout(() => {
      if (mounted && !abortController.signal.aborted) {
        setLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      abortController.abort();
      clearTimeout(fallbackTimeout);
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
