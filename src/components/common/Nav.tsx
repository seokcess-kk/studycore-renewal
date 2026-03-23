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
import { useMenuVisibility } from "@/hooks/useMenuVisibility";
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
  const isPending = useUserStore((state) => state.profile?.status === "pending");
  const logout = useUserStore((state) => state.logout);
  const unansweredCount = useUnansweredCount();
  const hasActiveMealPeriod = useActiveMealPeriod();
  const menuVisibility = useMenuVisibility();

  // 홈이 아닌 페이지에서는 앵커 링크 앞에 / 추가
  const getAnchorHref = (anchor: string) => (isHome ? anchor : `/${anchor}`);

  // 홈 이외 페이지 또는 스크롤 시 → 어두운 텍스트 모드
  const isDarkText = !isHome || isScrolled;

  // 링크 스타일
  const linkStyle = (isActive = false) =>
    `hidden md:block text-secondary transition-colors duration-150 ${isDarkText
      ? isActive
        ? "text-ink font-medium"
        : "text-muted hover:text-ink"
      : isActive
        ? "text-white font-medium"
        : "text-white/60 hover:text-white"
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
        className={`fixed top-0 left-0 right-0 z-[300] px-6 md:px-13 flex items-center justify-between transition-all duration-300 ${isDarkText
          ? "bg-white border-b border-rule"
          : "bg-transparent"
          } ${isScrolled ? "h-14" : isDarkText ? "h-16" : "h-20"}`}
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
                  <span className="absolute -top-1.5 -right-3.5 min-w-[18px] h-[18px] flex items-center justify-center bg-teal text-white text-label font-bold leading-none px-1">
                    {unansweredCount > 99 ? "99+" : unansweredCount}
                  </span>
                )}
              </Link>
              {!isStaff && hasActiveMealPeriod && (
                <Link href={ROUTES.MEAL} className={linkStyle(pathname === "/meal")}>
                  도시락
                </Link>
              )}
              <Link href={ROUTES.MANUAL} className={linkStyle(pathname === "/manual")}>
                매뉴얼
              </Link>
              {isStaff && (
                <Link href={ROUTES.GUIDE} className={linkStyle(pathname === "/guide")}>
                  온보딩
                </Link>
              )}
              {menuVisibility.blog && (
                <Link href={ROUTES.BLOG} className={linkStyle(pathname.startsWith("/blog"))}>
                  블로그
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
              {isStaff && !canAccessAdmin && (
                <Link href={ROUTES.ADMIN_GUIDE} className={linkStyle(pathname.startsWith("/admin/guide"))}>
                  조교 관리
                </Link>
              )}
              {isPending && (
                <span className="hidden md:inline-flex items-center px-2.5 py-1 bg-stone text-muted text-caption font-medium">
                  승인 대기
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`hidden md:block text-small transition-colors duration-150 ${isDarkText ? "text-muted hover:text-ink" : "text-white/50 hover:text-white/80"
                  } disabled:opacity-50 cursor-pointer`}
              >
                {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
              </button>
            </>
          ) : (
            <>
              <Link href={getAnchorHref("#features")} className={linkStyle()}>
                시스템
              </Link>
              <Link href={getAnchorHref("#space")} className={linkStyle()}>
                시설
              </Link>
              <Link href={getAnchorHref("#faq")} className={linkStyle()}>
                FAQ
              </Link>
              {menuVisibility.blog && (
                <Link href={ROUTES.BLOG} className={linkStyle(pathname.startsWith("/blog"))}>
                  블로그
                </Link>
              )}
              <Link
                href={ROUTES.LOGIN}
                className={`hidden md:block text-small transition-colors duration-150 ${isDarkText ? "text-muted hover:text-ink" : "text-white/50 hover:text-white/80"
                  }`}
              >
                로그인
              </Link>
              <Link
                href={ROUTES.CONSULT}
                className={`hidden md:block text-secondary font-bold tracking-cta px-5 py-2.5 border-[1.5px] transition-colors duration-300 cta-fill ${isDarkText
                  ? "cta-fill-navy border-navy text-white hover:text-navy"
                  : "cta-fill-teal border-teal text-navy-dark hover:text-teal"
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
            className={`hidden md:block p-1.5 transition-colors ${isDarkText ? "text-muted hover:text-ink" : "text-white/50 hover:text-white"
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
            className={`md:hidden p-1.5 transition-colors ${isDarkText ? "text-ink" : "text-white"
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
