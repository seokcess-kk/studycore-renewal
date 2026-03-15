"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminErrorBoundary } from "@/components/common/ErrorBoundary";
import { useUserStore } from "@/stores/useUserStore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, canAccessAdmin, isLoading } = useUserStore();

  useEffect(() => {
    // 로딩 중이면 대기
    if (isLoading) return;

    // 로그인 안 됨
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // 관리자/멘토 아님
    if (!canAccessAdmin) {
      router.replace("/");
      return;
    }
  }, [isAuthenticated, canAccessAdmin, isLoading, router]);

  // 로딩 중이거나 권한 없으면 로딩 표시
  if (isLoading || !isAuthenticated || !canAccessAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin border-2 border-navy border-t-transparent mx-auto" />
          <p className="text-muted">권한을 확인하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone">
      <AdminSidebar />
      <div className="pl-64">
        <AdminHeader />
        <main className="p-6">
          <AdminErrorBoundary>{children}</AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
