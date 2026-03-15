"use client";

import { useEffect, useCallback, useRef } from "react";
import { ToastProvider } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import type { User } from "@supabase/supabase-js";

/**
 * AuthInitializer - 비블로킹 인증 초기화
 *
 * 앱을 블로킹하지 않고 백그라운드에서 인증 상태를 확인합니다.
 * children은 즉시 렌더링되고, 인증 상태는 비동기로 업데이트됩니다.
 */
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((state) => state.setUser);
  const setProfile = useUserStore((state) => state.setProfile);
  const setLoading = useUserStore((state) => state.setLoading);
  const initialized = useRef(false);

  const fetchProfile = useCallback(
    async (authUser: User) => {
      try {
        const supabase = createClient();
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        setProfile(profile || null);
      } catch (error) {
        console.error("Profile fetch error:", error);
        setProfile(null);
      }
    },
    [setProfile]
  );

  useEffect(() => {
    // 이미 초기화되었으면 스킵
    if (initialized.current) return;
    initialized.current = true;

    let supabase: ReturnType<typeof createClient>;

    try {
      supabase = createClient();
    } catch (error) {
      console.error("Supabase client error:", error);
      setLoading(false);
      return;
    }

    let mounted = true;

    // 인증 상태 변경 리스너 먼저 설정
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });
        await fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // 초기 세션 확인 (백그라운드)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        });
        fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    }).catch((error) => {
      console.error("Auth init error:", error);
      if (mounted) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
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
      <AuthInitializer>{children}</AuthInitializer>
    </ToastProvider>
  );
}
