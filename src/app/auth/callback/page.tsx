"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";
import { ROUTES } from "@/lib/constants";

function LoadingUI() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-teal border-r-transparent" />
        <p className="mt-4 text-muted">로그인 처리 중...</p>
      </div>
    </div>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    // 이미 처리됨
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      const code = searchParams.get("code");
      const next = searchParams.get("next") ?? ROUTES.HOME;

      if (!code) {
        setError("인증 코드가 없습니다.");
        timeoutRef.current = setTimeout(() => router.replace(ROUTES.LOGIN), 2000);
        return;
      }

      try {
        const supabase = createBrowserClient();

        // 클라이언트에서 세션 교환
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Session exchange error:", exchangeError);
          setError("인증에 실패했습니다.");
          timeoutRef.current = setTimeout(() => router.replace(ROUTES.LOGIN), 2000);
          return;
        }

        // 세션 확인
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError("사용자 정보를 가져올 수 없습니다.");
          timeoutRef.current = setTimeout(() => router.replace(ROUTES.LOGIN), 2000);
          return;
        }

        // 프로필 존재 여부 확인
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, status")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // 프로필이 없으면 추가 정보 입력 페이지로
          router.replace("/register");
        } else if (profile.status === "pending") {
          // 승인 대기 중이면 register 페이지로
          router.replace("/register");
        } else {
          // 프로필이 있으면 다음 페이지로
          router.replace(next);
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("인증 처리 중 오류가 발생했습니다.");
        timeoutRef.current = setTimeout(() => router.replace(ROUTES.LOGIN), 2000);
      }
    };

    handleCallback();

    // Cleanup: 타임아웃 정리
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-muted text-sm">로그인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return <LoadingUI />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
