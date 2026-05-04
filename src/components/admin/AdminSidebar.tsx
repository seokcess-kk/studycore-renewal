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
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/useUserStore";
import { createBrowserClient } from "@/lib/supabase/client";
import { signOut } from "@/domains/user/service";
import { useUnansweredCount } from "@/hooks/useUnansweredCount";
import { isAssistant } from "@/lib/constants";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  assistantVisible?: boolean;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { label: "대시보드", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    title: "관리",
    items: [
      { label: "회원 관리", href: "/admin/members", icon: Users },
      { label: "상담 관리", href: "/admin/consultations", icon: Phone },
      { label: "도시락 관리", href: "/admin/meal", icon: UtensilsCrossed },
    ],
  },
  {
    title: "콘텐츠",
    items: [
      { label: "공지 관리", href: "/admin/notices", icon: Bell },
      { label: "질문 관리", href: "/admin/questions", icon: MessageSquare },
      { label: "블로그 관리", href: "/admin/blog", icon: FileText },
    ],
  },
  {
    title: "홈페이지",
    items: [
      { label: "프로그램 관리", href: "/admin/programs", icon: GraduationCap },
      { label: "공간 관리", href: "/admin/spaces", icon: ImageIcon },
      { label: "팝업 관리", href: "/admin/popups", icon: Layers },
    ],
  },
  {
    title: "운영",
    items: [
      { label: "안내 템플릿", href: "/admin/guide", icon: BookOpen, assistantVisible: true },
      { label: "설정", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { profile, logout } = useUserStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const unansweredCount = useUnansweredCount();

  const role = profile?.role;
  const isAssistantRole = isAssistant(role);

  // pathname 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileOpen(false); // eslint-disable-line react-hooks/set-state-in-effect -- 라우트 변경 시 메뉴 닫기
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

  // 역할별 필터링된 그룹 생성
  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (isAssistantRole) return item.assistantVisible === true;
        return true;
      }),
    }))
    .filter((group) => group.items.length > 0);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* 로고 */}
      <div className="flex h-16 items-center justify-between border-b border-rule px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="font-serif text-fluid-h2 font-bold text-navy">
            STUDYCORE
          </span>
          <span className="text-caption text-muted">Admin</span>
        </Link>
        {/* 모바일 닫기 버튼 */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1 text-muted hover:text-ink transition-colors duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {filteredGroups.map((group, groupIdx) => (
          <div key={group.title || groupIdx} className={cn(groupIdx > 0 && "mt-5")}>
            {/* 그룹 라벨 */}
            {group.title && (
              <p className="px-3 mb-1.5 text-label font-bold text-muted/60 uppercase tracking-label">
                {group.title}
              </p>
            )}

            {/* 메뉴 아이템 */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                const showBadge =
                  item.href === "/admin/questions" && unansweredCount > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-body font-medium transition-colors duration-200 cursor-pointer",
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
            </div>
          </div>
        ))}
      </nav>

      {/* 사용자 정보 + 로그아웃 */}
      <div className="border-t border-rule p-4">
        <div className="mb-3 px-3">
          <p className="text-body font-medium text-ink">
            {profile?.name || "관리자"}
          </p>
          <p className="text-caption text-muted">{profile?.role || "admin"}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 text-body font-medium text-muted transition-colors duration-200 hover:bg-stone hover:text-ink disabled:opacity-50 cursor-pointer"
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
          className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white border border-rule text-ink hover:bg-stone transition-colors duration-200 cursor-pointer"
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
