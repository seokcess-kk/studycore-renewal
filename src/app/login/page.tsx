"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Nav, Footer, Button, useToast } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { staffLoginSchema, type StaffLoginInput } from "@/domains/user/model";
import { useUserStore } from "@/stores/useUserStore";
import { ROUTES, CONTACT } from "@/lib/constants";
import { sanitizeRedirectPath } from "@/lib/auth-redirect";

function LoginContent() {
  const [showStaffLogin, setShowStaffLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirectPath(searchParams.get("redirect"), ROUTES.HOME);
  const { success, error: showError } = useToast();
  const login = useUserStore((state) => state.login);
  const isAuthLoading = useUserStore((state) => state.isLoading);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const profile = useUserStore((state) => state.profile);

  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated && profile) {
      router.replace(redirectTo);
    }
  }, [isAuthLoading, isAuthenticated, profile, router, redirectTo]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffLoginInput>({
    resolver: zodResolver(staffLoginSchema),
  });

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const callbackUrl = new URL("/auth/callback", "https://www.studycore.kr");
      callbackUrl.searchParams.set("next", redirectTo);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        showError("카카오 로그인에 실패했습니다.");
      }
    } catch {
      showError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const onStaffSubmit = async (data: StaffLoginInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/staff-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success && result.user && result.profile) {
        login(result.user, result.profile);
        success("로그인되었습니다.");
        window.location.href = redirectTo;
        return;
      } else {
        showError(result.error || "로그인에 실패했습니다.");
      }
    } catch {
      showError("로그인 중 오류가 발생했습니다.");
    }
    setIsLoading(false);
  };

  return (
    <>
      <Nav />
      <main className="page-body min-h-screen bg-stone flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto px-6">
          {/* 브랜드 */}
          <div className="text-center mb-10">
            <Image
              src="/logo-dark.png"
              alt="STUDYCORE 1.0"
              width={180}
              height={48}
              className="h-10 w-auto mx-auto mb-4"
              priority
            />
            <p className="text-muted text-secondary">
              재원생 서비스 로그인
            </p>
          </div>

          {/* 카카오 로그인 (메인 CTA) */}
          <button
            type="button"
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-kakao text-kakao-dark text-reading font-bold py-4 hover:brightness-95 transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 2C5.029 2 1 5.129 1 8.994c0 2.483 1.657 4.665 4.143 5.906-.182.681-.658 2.465-.753 2.848-.118.474.174.467.365.34.15-.1 2.387-1.617 3.358-2.273.287.041.58.066.877.082.34.019.682.028 1.01.028 4.971 0 9-3.129 9-6.993C19 5.129 14.971 2 10 2z"
                fill="#191919"
              />
            </svg>
            {isLoading ? "로그인 중..." : "카카오로 시작하기"}
          </button>

          {/* 안내 */}
          <p className="text-center text-small text-muted mt-4 leading-relaxed">
            최초 로그인 시 관리자 승인이 필요합니다.
          </p>

          {/* 구분선 */}
          <div className="mt-10 mb-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-rule" />
            <span className="text-small text-muted">문의</span>
            <div className="flex-1 h-px bg-rule" />
          </div>

          {/* 하단 링크 (한 줄) */}
          <div className="flex items-center justify-center gap-6 text-secondary">
            <a
              href={CONTACT.kakaoChannel}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:text-teal-dark transition-colors duration-200 cursor-pointer"
            >
              카카오 채널
            </a>
            <span className="text-rule">|</span>
            <Link
              href={ROUTES.CONSULT}
              className="text-teal hover:text-teal-dark transition-colors duration-200"
            >
              무료 상담 신청
            </Link>
          </div>

          {/* Staff 로그인 (접힘) */}
          <div className="mt-10">
            <button
              type="button"
              onClick={() => setShowStaffLogin(!showStaffLogin)}
              className="w-full flex items-center justify-center gap-1.5 text-small text-muted/60 hover:text-muted transition-colors duration-200 cursor-pointer"
            >
              Staff 로그인
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${showStaffLogin ? "rotate-180" : ""}`}
              />
            </button>

            {showStaffLogin && (
              <form
                onSubmit={handleSubmit(onStaffSubmit)}
                className="mt-4 space-y-4 border border-rule bg-white p-6"
              >
                <div>
                  <label htmlFor="staff-username" className="block mb-1.5 text-small font-medium text-ink">
                    아이디
                  </label>
                  <input
                    id="staff-username"
                    type="text"
                    placeholder="staff_id"
                    {...register("username")}
                    className="w-full px-3 py-2.5 border border-rule bg-white text-ink text-body placeholder:text-muted/40 focus:border-navy focus:outline-none"
                  />
                  {errors.username && (
                    <p className="mt-1 text-small text-red-500">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="staff-password" className="block mb-1.5 text-small font-medium text-ink">
                    비밀번호
                  </label>
                  <input
                    id="staff-password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className="w-full px-3 py-2.5 border border-rule bg-white text-ink text-body placeholder:text-muted/40 focus:border-navy focus:outline-none"
                  />
                  {errors.password && (
                    <p className="mt-1 text-small text-red-500">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                >
                  로그인
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-stone">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin border-4 border-solid border-teal border-r-transparent" />
        <p className="mt-4 text-muted">로딩 중...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
