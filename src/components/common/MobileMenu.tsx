"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { useUserStore } from "@/stores/useUserStore";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/domains/user/service";
import { useUnansweredCount } from "@/hooks/useUnansweredCount";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const canAccessAdmin = useUserStore((state) => state.canAccessAdmin);
  const isStaff = useUserStore((state) => state.isStaff);
  const logout = useUserStore((state) => state.logout);
  const unansweredCount = useUnansweredCount();

  // pathname 변경 시 자동 닫힘
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const supabase = createClient();
    await signOut(supabase);
    logout();
    window.location.href = "/";
  };

  const getAnchorHref = (anchor: string) => (isHome ? anchor : `/${anchor}`);

  const linkClass = (isActive = false) =>
    `block py-3 text-[16px] font-medium transition-colors ${
      isActive ? "text-teal" : "text-white/80 hover:text-white"
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ type: "tween", duration: 0.25 }}
          className="fixed inset-0 z-[400] bg-navy-dark flex flex-col"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between h-16 px-6">
            <span className="font-serif text-lg font-bold text-white">
              STUDYCORE
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* 메뉴 */}
          <nav className="flex-1 px-8 pt-4 overflow-y-auto">
            {isAuthenticated ? (
              <>
                <Link
                  href={ROUTES.NOTICES}
                  className={linkClass(pathname.startsWith("/notices"))}
                >
                  공지사항
                </Link>
                <Link
                  href={ROUTES.QUESTIONS}
                  className={`${linkClass(pathname.startsWith("/questions"))} flex items-center gap-2`}
                >
                  질문방
                  {canAccessAdmin && unansweredCount > 0 && (
                    <span className="min-w-[20px] h-[20px] flex items-center justify-center bg-teal text-white text-[11px] font-bold px-1.5">
                      {unansweredCount > 99 ? "99+" : unansweredCount}
                    </span>
                  )}
                </Link>
                {!isStaff && (
                  <Link
                    href={ROUTES.MEAL}
                    className={linkClass(pathname === "/meal")}
                  >
                    도시락
                  </Link>
                )}
                {isStaff && (
                  <Link
                    href={ROUTES.GUIDE}
                    className={linkClass(pathname === "/guide")}
                  >
                    온보딩
                  </Link>
                )}
                <Link
                  href={ROUTES.MY}
                  className={linkClass(pathname === "/my")}
                >
                  마이페이지
                </Link>
                {canAccessAdmin && (
                  <Link
                    href={ROUTES.ADMIN}
                    className={linkClass(pathname.startsWith("/admin"))}
                  >
                    관리자
                  </Link>
                )}

                <div className="border-t border-white/10 mt-6 pt-6">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-[14px] text-white/40 hover:text-white/70 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href={getAnchorHref("#features")}
                  className={linkClass()}
                >
                  특징
                </Link>
                <Link href={getAnchorHref("#space")} className={linkClass()}>
                  시설
                </Link>
                <Link href={getAnchorHref("#faq")} className={linkClass()}>
                  FAQ
                </Link>

                <div className="border-t border-white/10 mt-6 pt-6 space-y-3">
                  <Link
                    href={ROUTES.LOGIN}
                    className="block text-[14px] text-white/50 hover:text-white transition-colors"
                  >
                    로그인
                  </Link>
                  <Link
                    href={ROUTES.CONSULT}
                    className="block text-center py-3 bg-teal text-navy-dark text-[14px] font-bold"
                  >
                    무료 상담 신청
                  </Link>
                </div>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
