"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminErrorBoundary } from "@/components/common/ErrorBoundary";
import { useUserStore } from "@/stores/useUserStore";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, canAccessAdmin, isStaff, isLoading } = useUserStore();

  // /admin/guide는 assistant도 접근 가능 (isStaffRole)
  const isGuideRoute = pathname.startsWith("/admin/guide");
  const hasAccess = isGuideRoute ? isStaff : canAccessAdmin;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!hasAccess) {
      router.replace("/");
      return;
    }
  }, [isAuthenticated, hasAccess, isLoading, router]);

  if (isLoading || !isAuthenticated || !hasAccess) {
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
      <div className="lg:pl-64">
        <AdminHeader />
        <main className="p-4 pt-16 lg:pt-6 lg:p-6">
          <AdminErrorBoundary>{children}</AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
