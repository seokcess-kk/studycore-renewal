"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Globe, Home } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin": "대시보드",
  "/admin/members": "회원 관리",
  "/admin/members/new": "스태프 계정 생성",
  "/admin/notices": "공지 관리",
  "/admin/notices/new": "공지 작성",
  "/admin/questions": "질문 관리",
  "/admin/settings": "설정",
  "/admin/guide": "조교 온보딩",
  "/admin/blog": "블로그 관리",
  "/admin/blog/new": "새 포스트",
  "/admin/meal": "도시락 관리",
  "/admin/kakao": "알림톡 발송",
  "/admin/consultations": "상담 관리",
  "/admin/popups": "팝업 관리",
  "/admin/popups/new": "팝업 생성",
  "/admin/programs": "프로그램 관리",
  "/admin/programs/new": "프로그램 등록",
};

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminHeaderProps {
  title?: string;
  breadcrumb?: BreadcrumbItem[];
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;

    // UUID 패턴 체크 (회원 상세 등)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);

    if (isUuid) {
      breadcrumbs.push({ label: "상세", href: currentPath });
    } else if (segment === "consult") {
      breadcrumbs.push({ label: "상담 기록", href: currentPath });
    } else if (segment === "edit") {
      breadcrumbs.push({ label: "수정", href: currentPath });
    } else if (pageTitles[currentPath]) {
      breadcrumbs.push({ label: pageTitles[currentPath], href: currentPath });
    }
  }

  return breadcrumbs;
}

export function AdminHeader({ title, breadcrumb }: AdminHeaderProps = {}) {
  const pathname = usePathname();
  const defaultBreadcrumbs = getBreadcrumbs(pathname);
  const breadcrumbs = breadcrumb || defaultBreadcrumbs;
  const currentTitle = title || breadcrumbs[breadcrumbs.length - 1]?.label || "대시보드";

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        {/* 브레드크럼 */}
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/admin"
            className="flex items-center text-muted hover:text-ink"
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href || index} className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted" />
              {index === breadcrumbs.length - 1 || !crumb.href ? (
                <span className="font-medium text-ink">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-muted hover:text-ink"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* 페이지 타이틀 + 홈페이지 링크 */}
        <div className="flex items-center gap-4">
          <h1 className="font-serif text-xl font-bold text-navy">
            {currentTitle}
          </h1>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-teal transition-colors"
          >
            <Globe className="h-4 w-4" />
            홈페이지
          </a>
        </div>
      </div>
    </header>
  );
}
