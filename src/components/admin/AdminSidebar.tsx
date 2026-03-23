"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Bell,
  MessageSquare,
  UtensilsCrossed,
  Settings,
  BookOpen,
  LogOut,
  Phone,
  Layers,
  GraduationCap,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { createBrowserClient } from "@/lib/supabase/client";
import { signOut } from "@/domains/user/service";
import { useUnansweredCount } from "@/hooks/useUnansweredCount";

const navItems = [
  {
    label: "대시보드",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "회원 관리",
    href: "/admin/members",
    icon: Users,
  },
  {
    label: "공지 관리",
    href: "/admin/notices",
    icon: Bell,
  },
  {
    label: "질문 관리",
    href: "/admin/questions",
    icon: MessageSquare,
  },
  {
    label: "상담 관리",
    href: "/admin/consultations",
    icon: Phone,
  },
  {
    label: "팝업 관리",
    href: "/admin/popups",
    icon: Layers,
  },
  {
    label: "프로그램 관리",
    href: "/admin/programs",
    icon: GraduationCap,
  },
  {
    label: "블로그 관리",
    href: "/admin/blog",
    icon: FileText,
  },
  {
    label: "도시락 관리",
    href: "/admin/meal",
    icon: UtensilsCrossed,
  },
  {
    label: "조교 온보딩",
    href: "/admin/guide",
    icon: BookOpen,
  },
  {
    label: "설정",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { profile, logout } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const unansweredCount = useUnansweredCount();

  // pathname 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // 모바일 사이드바 열릴 때 body scroll lock
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const supabase = createBrowserClient();
    await signOut(supabase);
    logout();
    window.location.href = "/";
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* 로고 */}
      <div className="flex h-16 items-center justify-between border-b border-rule px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold text-navy">
            STUDYCORE
          </span>
          <span className="text-xs text-muted">Admin</span>
        </Link>
        {/* 모바일 닫기 버튼 */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1 text-muted hover:text-ink"
        >
          <X size={20} />
        </button>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          const showBadge =
            item.href === "/admin/questions" && unansweredCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-navy text-white"
                  : "text-ink hover:bg-stone"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span
                  className={cn(
                    "min-w-[20px] h-[20px] flex items-center justify-center text-caption font-bold px-1.5",
                    active ? "bg-white text-navy" : "bg-teal text-white"
                  )}
                >
                  {unansweredCount > 99 ? "99+" : unansweredCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* 사용자 정보 + 로그아웃 */}
      <div className="border-t border-rule p-4">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-ink">
            {profile?.name || "관리자"}
          </p>
          <p className="text-xs text-muted">{profile?.role || "admin"}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-stone hover:text-ink disabled:opacity-50"
        >
          <LogOut className="h-5 w-5" />
          {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white border border-rule text-ink hover:bg-stone transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu size={20} />
        </button>
      )}

      {/* 모바일 오버레이 */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[45] bg-ink/30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 사이드바 — 데스크탑: 항상 표시, 모바일: 오버레이 */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r border-rule bg-white transition-transform duration-200",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
