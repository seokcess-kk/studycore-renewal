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
    let initialized = false;

    // 타임아웃: 3초 후 강제로 ready 상태로 전환
    const timeout = setTimeout(() => {
      if (mounted && !initialized) {
        console.warn("Auth init timeout - forcing ready state");
        setLoading(false);
        setIsReady(true);
        initialized = true;
      }
    }, 3000);

    const handleSession = async (session: { user: User } | null) => {
      if (!mounted || initialized) return;

      try {
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
        console.error("Session handling error:", error);
        setUser(null);
        setProfile(null);
      } finally {
        if (mounted && !initialized) {
          clearTimeout(timeout);
          setLoading(false);
          setIsReady(true);
          initialized = true;
        }
      }
    };

    // 인증 상태 변경 리스너 (INITIAL_SESSION 포함)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "INITIAL_SESSION") {
          // 초기 세션 처리 - getSession() 대신 이 이벤트 사용
          await handleSession(session);
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
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
      clearTimeout(timeout);
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
