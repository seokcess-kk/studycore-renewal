"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/domains/user/service";
import { useUnansweredCount } from "@/hooks/useUnansweredCount";
import { useActiveMealPeriod } from "@/hooks/useActiveMealPeriod";
import { MobileMenu } from "./MobileMenu";
import { SearchModal } from "./SearchModal";

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  // hydration 완료 체크 (SSR/CSR 불일치 방지)
  useEffect(() => { setIsMounted(true); }, []);

  // 인증 상태 (sessionStorage persist → hydrate 후 즉시 사용 가능)
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const canAccessAdmin = useUserStore((state) => state.canAccessAdmin);
  const isStaff = useUserStore((state) => state.isStaff);
  const logout = useUserStore((state) => state.logout);
  const unansweredCount = useUnansweredCount();
  const hasActiveMealPeriod = useActiveMealPeriod();

  // 홈이 아닌 페이지에서는 앵커 링크 앞에 / 추가
  const getAnchorHref = (anchor: string) => (isHome ? anchor : `/${anchor}`);

  // 홈 이외 페이지 또는 스크롤 시 → 어두운 텍스트 모드
  const isDarkText = !isHome || isScrolled;

  // 링크 스타일
  const linkStyle = (isActive = false) =>
    `hidden md:block text-[13px] transition-colors duration-150 ${
      isDarkText
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

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[300] h-16 px-6 md:px-13 flex items-center justify-between transition-all duration-300 ${
          isDarkText
            ? "bg-white/97 backdrop-blur-[12px] border-b border-rule shadow-[0_1px_0_var(--color-rule)]"
            : "bg-transparent"
        } ${isScrolled ? "h-14" : "h-16"}`}
      >
        {/* 로고 */}
        <Link href={ROUTES.HOME} className="flex items-center">
          <Image
            src={isDarkText ? "/logo-dark.png" : "/logo-light.png"}
            alt="STUDYCORE 1.0"
            width={200}
            height={52}
            priority
            className={`${isScrolled ? "h-9" : "h-10 md:h-11"} w-auto transition-all duration-300 opacity-100`}
          />
        </Link>

        {/* 데스크톱 네비게이션 링크 */}
        <div className="flex items-center gap-6 md:gap-9">
          {isMounted && isAuthenticated ? (
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
              {!isStaff && hasActiveMealPeriod && (
                <Link href={ROUTES.MEAL} className={linkStyle(pathname === "/meal")}>
                  도시락
                </Link>
              )}
              {isStaff ? (
                <Link href={ROUTES.GUIDE} className={linkStyle(pathname === "/guide")}>
                  온보딩
                </Link>
              ) : (
                <Link href={ROUTES.MANUAL} className={linkStyle(pathname === "/manual")}>
                  매뉴얼
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
                  isDarkText ? "text-ink/30 hover:text-ink/60" : "text-white/30 hover:text-white/60"
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
                  isDarkText ? "text-ink/30 hover:text-ink/60" : "text-white/30 hover:text-white/60"
                }`}
              >
                로그인
              </Link>
              <Link
                href={ROUTES.CONSULT}
                className={`hidden md:block text-[12.5px] font-bold tracking-[0.04em] px-5 py-2.5 border-[1.5px] transition-all duration-200 ${
                  isDarkText
                    ? "bg-navy border-navy text-white hover:bg-transparent hover:text-navy"
                    : "bg-teal border-teal text-navy-dark hover:bg-transparent hover:text-teal"
                }`}
              >
                무료 상담 신청
              </Link>
            </>
          )}

          {/* 검색 버튼 */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className={`hidden md:block p-1.5 transition-colors ${
              isDarkText ? "text-ink/30 hover:text-ink" : "text-white/30 hover:text-white"
            }`}
            aria-label="검색"
            title="검색 (Ctrl+K)"
          >
            <Search size={18} />
          </button>

          {/* 모바일 햄버거 버튼 */}
          <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`md:hidden p-1.5 transition-colors ${
                isDarkText ? "text-ink" : "text-white"
              }`}
              aria-label="메뉴 열기"
            >
              <Menu size={24} />
            </button>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

      {/* 검색 모달 */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
