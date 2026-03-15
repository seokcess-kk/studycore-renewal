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

    // 초기 세션 확인
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

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

    initAuth();

    // 인증 상태 변경 리스너
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
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (event === "INITIAL_SESSION") {
          // 초기 세션은 initAuth에서 처리됨
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setProfile, setLoading, fetchProfile]);

  // 초기 로딩 중에는 children을 렌더링하지 않음 (hydration 불일치 방지)
  if (!isReady) {
    return null;
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
