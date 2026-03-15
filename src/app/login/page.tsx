"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Nav, Footer, Button, useToast } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { staffLogin } from "@/domains/user/service";
import { staffLoginSchema, type StaffLoginInput } from "@/domains/user/model";
import { useUserStore } from "@/stores/useUserStore";
import { ROUTES, CONTACT } from "@/lib/constants";

export default function LoginPage() {
  const [loginType, setLoginType] = useState<"kakao" | "staff">("kakao");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { success, error: showError } = useToast();
  const login = useUserStore((state) => state.login);
  const isAuthLoading = useUserStore((state) => state.isLoading);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const profile = useUserStore((state) => state.profile);

  // 이미 로그인된 경우 리다이렉트 (store 기반)
  useEffect(() => {
    // 인증 상태 로딩 중이면 대기
    if (isAuthLoading) return;

    if (isAuthenticated && profile) {
      if (["admin", "mentor"].includes(profile.role)) {
        router.replace(ROUTES.ADMIN);
      } else {
        router.replace(ROUTES.HOME);
      }
    }
  }, [isAuthLoading, isAuthenticated, profile, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffLoginInput>({
    resolver: zodResolver(staffLoginSchema),
  });

  // 카카오 로그인
  const handleKakaoLogin = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "kakao",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
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

  // Staff 로그인
  const onStaffSubmit = async (data: StaffLoginInput) => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const result = await staffLogin(supabase, data);

      if (result.success && result.user && result.profile) {
        login(result.user, result.profile);
        success("로그인되었습니다.");
        router.push(ROUTES.ADMIN);
      } else {
        console.error("Staff login failed:", result.error);
        showError(result.error || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error("Staff login error:", err);
      showError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Nav />
      <main className="pt-24 pb-20 min-h-screen bg-stone">
        <div className="max-w-md mx-auto px-6 py-12">
          {/* 헤더 */}
          <div className="text-center mb-10">
            <h1 className="font-serif text-3xl font-bold text-ink mb-2">
              로그인
            </h1>
            <p className="text-muted text-[14px]">
              스터디코어 1.0 재원생 서비스
            </p>
          </div>

          {/* 로그인 타입 선택 */}
          <div className="flex border border-rule mb-8">
            <button
              type="button"
              onClick={() => setLoginType("kakao")}
              className={`flex-1 py-3 text-[14px] font-medium transition-colors ${
                loginType === "kakao"
                  ? "bg-navy text-white"
                  : "bg-white text-ink hover:bg-stone"
              }`}
            >
              재원생 (카카오)
            </button>
            <button
              type="button"
              onClick={() => setLoginType("staff")}
              className={`flex-1 py-3 text-[14px] font-medium transition-colors ${
                loginType === "staff"
                  ? "bg-navy text-white"
                  : "bg-white text-ink hover:bg-stone"
              }`}
            >
              Staff
            </button>
          </div>

          {/* 카카오 로그인 */}
          {loginType === "kakao" && (
            <div className="space-y-6">
              <button
                type="button"
                onClick={handleKakaoLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#191919] text-[15px] font-bold py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 2C5.029 2 1 5.129 1 8.994c0 2.483 1.657 4.665 4.143 5.906-.182.681-.658 2.465-.753 2.848-.118.474.174.467.365.34.15-.1 2.387-1.617 3.358-2.273.287.041.58.066.877.082.34.019.682.028 1.01.028 4.971 0 9-3.129 9-6.993C19 5.129 14.971 2 10 2z"
                    fill="#191919"
                  />
                </svg>
                {isLoading ? "로그인 중..." : "카카오로 로그인"}
              </button>

              <div className="text-center">
                <p className="text-[13px] text-muted leading-relaxed">
                  재원생으로 등록된 카카오 계정으로 로그인해 주세요.
                  <br />
                  최초 로그인 시 관리자 승인이 필요합니다.
                </p>
              </div>
            </div>
          )}

          {/* Staff 로그인 */}
          {loginType === "staff" && (
            <form onSubmit={handleSubmit(onStaffSubmit)} className="space-y-6">
              <div>
                <label className="block mb-2 text-[14px] font-medium text-ink">
                  아이디
                </label>
                <input
                  type="text"
                  placeholder="staff_id"
                  {...register("username")}
                  className="w-full px-4 py-3 border border-rule bg-white text-ink text-[15px] placeholder:text-muted/50 focus:border-navy focus:outline-none"
                />
                {errors.username && (
                  <p className="mt-1 text-[13px] text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-[14px] font-medium text-ink">
                  비밀번호
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full px-4 py-3 border border-rule bg-white text-ink text-[15px] placeholder:text-muted/50 focus:border-navy focus:outline-none"
                />
                {errors.password && (
                  <p className="mt-1 text-[13px] text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
              >
                로그인
              </Button>

              <p className="text-center text-[13px] text-muted">
                Staff 계정은 관리자에게 문의해 주세요.
              </p>
            </form>
          )}

          {/* 하단 링크 */}
          <div className="mt-12 pt-8 border-t border-rule text-center">
            <p className="text-[14px] text-muted mb-4">
              아직 재원생이 아니신가요?
            </p>
            <Link
              href={ROUTES.CONSULT}
              className="inline-block text-teal text-[14px] font-medium underline"
            >
              무료 상담 신청하기
            </Link>
          </div>

          {/* 문의 안내 */}
          <div className="mt-8 p-4 bg-white border border-rule text-center">
            <p className="text-[13px] text-muted">
              로그인에 문제가 있으신가요?{" "}
              <a
                href={CONTACT.kakaoChannel}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal underline"
              >
                카카오 채널
              </a>
              로 문의해 주세요.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
