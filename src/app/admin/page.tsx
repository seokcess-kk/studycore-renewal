"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  UserPlus,
  ArrowRight,
  Phone,
} from "lucide-react";
import { AdminCard, AdminCardGrid } from "@/components/admin/AdminCard";
import { StatusBadge, QuestionStatusBadge } from "@/components/admin/StatusBadge";
import { createBrowserClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "@/lib/utils";
import { formatPhoneDisplay } from "@/hooks/usePhoneFormat";

interface DashboardStats {
  newConsultations: number;
  pendingMembers: number;
  pendingQuestions: number;
  activeStudents: number;
}

interface RecentItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  status?: string;
}

export default function AdminDashboardPage() {
  const supabase = createBrowserClient();
  const [stats, setStats] = useState<DashboardStats>({
    newConsultations: 0,
    pendingMembers: 0,
    pendingQuestions: 0,
    activeStudents: 0,
  });
  const [recentConsultations, setRecentConsultations] = useState<RecentItem[]>([]);
  const [recentQuestions, setRecentQuestions] = useState<RecentItem[]>([]);
  const [recentMembers, setRecentMembers] = useState<RecentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 통계 조회
        const [
          { count: newConsultCount },
          { count: pendingMemberCount },
          { count: pendingQuestionCount },
          { count: activeStudentCount },
        ] = await Promise.all([
          supabase
            .from("consultations")
            .select("*", { count: "exact", head: true })
            .eq("status", "new"),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("questions")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "student")
            .eq("status", "active"),
        ]);

        setStats({
          newConsultations: newConsultCount || 0,
          pendingMembers: pendingMemberCount || 0,
          pendingQuestions: pendingQuestionCount || 0,
          activeStudents: activeStudentCount || 0,
        });

        // 최근 상담 신청
        const { data: consultations } = await supabase
          .from("consultations")
          .select("id, name, phone, created_at, status")
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentConsultations(
          (consultations || []).map((c) => ({
            id: c.id,
            title: c.name,
            subtitle: formatPhoneDisplay(c.phone),
            date: c.created_at,
            status: c.status,
          }))
        );

        // 최근 질문
        const { data: questions } = await supabase
          .from("questions")
          .select("id, title, created_at, status, author:profiles!author_id(name)")
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentQuestions(
          (questions || []).map((q) => {
            const author = q.author as unknown as { name: string } | null;
            return {
              id: q.id,
              title: q.title,
              subtitle: author?.name || "알 수 없음",
              date: q.created_at,
              status: q.status,
            };
          })
        );

        // 최근 가입 신청
        const { data: members } = await supabase
          .from("profiles")
          .select("id, name, school, created_at, status")
          .eq("role", "student")
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentMembers(
          (members || []).map((m) => ({
            id: m.id,
            title: m.name,
            subtitle: m.school || "학교 미입력",
            date: m.created_at,
            status: m.status,
          }))
        );
      } catch (error) {
        console.error("대시보드 데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminCardGrid>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse border border-rule bg-white"
            />
          ))}
        </AdminCardGrid>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 통계 카드 */}
      <AdminCardGrid>
        <AdminCard
          title="신규 상담"
          value={stats.newConsultations}
          description="처리 대기 중"
          icon={Phone}
        />
        <AdminCard
          title="승인 대기"
          value={stats.pendingMembers}
          description="가입 신청"
          icon={UserPlus}
        />
        <AdminCard
          title="미답변 질문"
          value={stats.pendingQuestions}
          description="답변 대기 중"
          icon={MessageSquare}
        />
        <AdminCard
          title="총 재원생"
          value={stats.activeStudents}
          description="활성 계정"
          icon={Users}
        />
      </AdminCardGrid>

      {/* 최근 활동 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 최근 상담 신청 */}
        <RecentActivityCard
          title="최근 상담 신청"
          icon={Phone}
          items={recentConsultations}
          linkHref="/admin/consultations"
          linkText="전체 보기"
          emptyText="상담 신청이 없습니다"
          renderStatus={(status) => (
            <span
              className={
                status === "new"
                  ? "text-caption text-orange-600"
                  : status === "contacted"
                  ? "text-caption text-blue-600"
                  : "text-caption text-green-600"
              }
            >
              {status === "new"
                ? "신규"
                : status === "contacted"
                ? "연락함"
                : "완료"}
            </span>
          )}
        />

        {/* 최근 질문 */}
        <RecentActivityCard
          title="최근 질문"
          icon={MessageSquare}
          items={recentQuestions}
          linkHref="/admin/questions"
          linkText="전체 보기"
          emptyText="질문이 없습니다"
          renderStatus={(status) => (
            <QuestionStatusBadge
              status={status as "pending" | "answered"}
              size="sm"
            />
          )}
        />

        {/* 최근 가입 신청 */}
        <RecentActivityCard
          title="최근 가입 신청"
          icon={UserPlus}
          items={recentMembers}
          linkHref="/admin/members"
          linkText="전체 보기"
          emptyText="가입 신청이 없습니다"
          renderStatus={(status) => (
            <StatusBadge
              status={status as "pending" | "active" | "inactive"}
              size="sm"
            />
          )}
        />
      </div>
    </div>
  );
}

interface RecentActivityCardProps {
  title: string;
  icon: typeof Users;
  items: RecentItem[];
  linkHref: string;
  linkText: string;
  emptyText: string;
  renderStatus: (status: string) => React.ReactNode;
}

function RecentActivityCard({
  title,
  icon: Icon,
  items,
  linkHref,
  linkText,
  emptyText,
  renderStatus,
}: RecentActivityCardProps) {
  return (
    <div className="border border-rule bg-white">
      <div className="flex items-center justify-between border-b border-rule px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-navy" />
          <h3 className="font-medium text-ink">{title}</h3>
        </div>
        <Link
          href={linkHref}
          className="flex items-center gap-1 text-body text-teal hover:underline"
        >
          {linkText}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="divide-y divide-rule">
        {items.length === 0 ? (
          <p className="px-4 py-8 text-center text-muted">{emptyText}</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-body font-medium text-ink">
                  {item.title}
                </p>
                <p className="text-caption text-muted">{item.subtitle}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {item.status && renderStatus(item.status)}
                <span className="text-caption text-muted">
                  {formatDistanceToNow(item.date)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
