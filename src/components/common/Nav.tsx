"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/domains/user/service";
import { useUnansweredCount } from "@/hooks/useUnansweredCount";
import { MobileMenu } from "./MobileMenu";

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  // 인증 상태
  const isLoading = useUserStore((state) => state.isLoading);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const canAccessAdmin = useUserStore((state) => state.canAccessAdmin);
  const isStaff = useUserStore((state) => state.isStaff);
  const logout = useUserStore((state) => state.logout);
  const unansweredCount = useUnansweredCount();

  // 홈이 아닌 페이지에서는 앵커 링크 앞에 / 추가
  const getAnchorHref = (anchor: string) => (isHome ? anchor : `/${anchor}`);

  // 링크 스타일
  const linkStyle = (isActive = false) =>
    `hidden md:block text-[13px] transition-colors duration-150 ${
      isScrolled
        ? isActive
          ? "text-ink font-medium"
          : "text-ink/45 hover:text-ink"
        : isActive
          ? "text-white font-medium"
          : "text-white/50 hover:text-white"
    }`;

  // 로그아웃 핸들러
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const supabase = createClient();
    await signOut(supabase);
    logout();
    window.location.href = "/";
  };

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[300] h-16 px-6 md:px-13 flex items-center justify-between transition-all duration-300 ${
          isScrolled
            ? "bg-white/97 backdrop-blur-[12px] border-b border-rule"
            : "bg-transparent"
        }`}
      >
        {/* 로고 */}
        <Link href={ROUTES.HOME} className="flex items-center">
          <Image
            src={isScrolled ? "/logo-dark.png" : "/logo-light.png"}
            alt="STUDYCORE 1.0"
            width={200}
            height={52}
            priority
            className="h-10 md:h-11 w-auto transition-opacity duration-300"
          />
        </Link>

        {/* 데스크톱 네비게이션 링크 */}
        <div className="flex items-center gap-6 md:gap-9">
          {isLoading ? null : isAuthenticated ? (
            <>
              <Link href={ROUTES.NOTICES} className={linkStyle(pathname.startsWith("/notices"))}>
                공지사항
              </Link>
              <Link href={ROUTES.QUESTIONS} className={`${linkStyle(pathname.startsWith("/questions"))} relative`}>
                질문방
                {canAccessAdmin && unansweredCount > 0 && (
                  <span className="absolute -top-1.5 -right-3.5 min-w-[18px] h-[18px] flex items-center justify-center bg-teal text-white text-[10px] font-bold leading-none px-1">
                    {unansweredCount > 99 ? "99+" : unansweredCount}
                  </span>
                )}
              </Link>
              {!isStaff && (
                <Link href={ROUTES.MEAL} className={linkStyle(pathname === "/meal")}>
                  도시락
                </Link>
              )}
              <Link href={ROUTES.MY} className={linkStyle(pathname === "/my")}>
                마이페이지
              </Link>
              {canAccessAdmin && (
                <Link href={ROUTES.ADMIN} className={linkStyle(pathname.startsWith("/admin"))}>
                  관리자
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`hidden md:block text-[12px] transition-colors duration-150 ${
                  isScrolled ? "text-ink/30 hover:text-ink/60" : "text-white/30 hover:text-white/60"
                } disabled:opacity-50`}
              >
                {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
              </button>
            </>
          ) : (
            <>
              <Link href={getAnchorHref("#features")} className={linkStyle()}>
                특징
              </Link>
              <Link href={getAnchorHref("#space")} className={linkStyle()}>
                시설
              </Link>
              <Link href={getAnchorHref("#faq")} className={linkStyle()}>
                FAQ
              </Link>
              <Link
                href={ROUTES.LOGIN}
                className={`hidden md:block text-[12px] transition-colors duration-150 ${
                  isScrolled ? "text-ink/30 hover:text-ink/60" : "text-white/30 hover:text-white/60"
                }`}
              >
                로그인
              </Link>
              <Link
                href={ROUTES.CONSULT}
                className={`hidden md:block text-[12.5px] font-bold tracking-[0.04em] px-5 py-2.5 border-[1.5px] transition-all duration-200 ${
                  isScrolled
                    ? "bg-navy border-navy text-white hover:bg-transparent hover:text-navy"
                    : "bg-teal border-teal text-navy-dark hover:bg-transparent hover:text-teal"
                }`}
              >
                무료 상담 신청
              </Link>
            </>
          )}

          {/* 모바일 햄버거 버튼 */}
          {!isLoading && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`md:hidden p-1.5 transition-colors ${
                isScrolled ? "text-ink" : "text-white"
              }`}
              aria-label="메뉴 열기"
            >
              <Menu size={24} />
            </button>
          )}
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  );
}
