"use client";

import { useEffect, useState, useCallback } from "react";
import { ToastProvider } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import type { User } from "@supabase/supabase-js";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((state) => state.setUser);
  const setProfile = useUserStore((state) => state.setProfile);
  const setLoading = useUserStore((state) => state.setLoading);
  const [isReady, setIsReady] = useState(false);

  const fetchProfile = useCallback(async (supabase: ReturnType<typeof createClient>, authUser: User) => {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (profile) {
        setProfile(profile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      setProfile(null);
    }
  }, [setProfile]);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const initialize = async () => {
      try {
        // 타임아웃과 함께 세션 확인 (2초 제한)
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => {
          setTimeout(() => resolve({ data: { session: null } }), 2000);
        });

        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);

        if (!mounted) return;

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
          });
          await fetchProfile(supabase, session.user);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth init error:", error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsReady(true);
        }
      }
    };

    // 초기화 실행
    initialize();

    // 인증 상태 변경 리스너 (로그인/로그아웃 감지)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email || "",
            });
            await fetchProfile(supabase, session.user);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser, setProfile, setLoading, fetchProfile]);

  // 초기 로딩 중에는 로딩 UI 표시
  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-teal border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted">로딩 중...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthInitializer>{children}</AuthInitializer>
    </ToastProvider>
  );
}
