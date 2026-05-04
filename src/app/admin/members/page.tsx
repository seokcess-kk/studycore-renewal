"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, UserPlus } from "lucide-react";
import { Skeleton } from "@/components/common";
import { Button } from "@/components/common/Button";
import { Pagination } from "@/components/common/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { createBrowserClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { formatPhoneDisplay } from "@/hooks/usePhoneFormat";
import type { Profile, UserRoleType, UserStatusType } from "@/domains/user/model";

type FilterRole = UserRoleType | "all";
type FilterStatus = UserStatusType | "all";

const PAGE_SIZE = 20;

const ROLE_OPTIONS: { value: FilterRole; label: string }[] = [
  { value: "all", label: "모든 역할" },
  { value: "student", label: "재원생" },
  { value: "assistant", label: "조교" },
  { value: "mentor", label: "멘토" },
  { value: "admin", label: "관리자" },
];

const STATUS_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "모든 상태" },
  { value: "pending", label: "승인 대기" },
  { value: "active", label: "활성" },
  { value: "inactive", label: "비활성" },
];

function isFilterRole(v: string | null): v is FilterRole {
  return v === "all" || v === "student" || v === "assistant" || v === "mentor" || v === "admin";
}

function isFilterStatus(v: string | null): v is FilterStatus {
  return v === "all" || v === "pending" || v === "active" || v === "inactive";
}

function AdminMembersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createBrowserClient());

  const roleParam = searchParams.get("role");
  const statusParam = searchParams.get("status");
  const role: FilterRole = isFilterRole(roleParam) ? roleParam : "all";
  const status: FilterStatus = isFilterStatus(statusParam) ? statusParam : "all";
  const q = searchParams.get("q") || "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const [searchInput, setSearchInput] = useState(q);
  const [members, setMembers] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const updateQuery = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === "") sp.delete(key);
      else sp.set(key, value);
    }
    const qs = sp.toString();
    router.push(qs ? `/admin/members?${qs}` : "/admin/members");
  };

  // 검색 debounce 300ms
  useEffect(() => {
    if (searchInput === q) return;
    const t = setTimeout(() => {
      updateQuery({ q: searchInput || undefined, page: undefined });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // 외부 query 변화 시 input 동기화 (뒤로가기 등)
  useEffect(() => {
    setSearchInput(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  useEffect(() => {
    async function fetchMembers() {
      setIsLoading(true);
      try {
        const from = (page - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase
          .from("profiles")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false })
          .range(from, to);

        if (role !== "all") query = query.eq("role", role);
        if (status !== "all") query = query.eq("status", status);
        if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);

        const { data, count, error } = await query;
        if (error) throw error;
        setMembers((data as Profile[]) || []);
        const fetchedTotal = count ?? 0;
        setTotal(fetchedTotal);
        setTotalPages(Math.max(1, Math.ceil(fetchedTotal / PAGE_SIZE)));
      } catch (error) {
        console.error("회원 목록 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMembers();
  }, [supabase, role, status, q, page]);

  const handlePageChange = (p: number) => {
    updateQuery({ page: p === 1 ? undefined : String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* 상단 액션 */}
      <div className="flex flex-wrap items-center gap-3 md:gap-4">
        <span className="text-muted text-body">총 {total}명</span>

        {/* 검색 */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="이름, 전화번호 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-9 md:h-10 w-full sm:w-56 md:w-64 border border-rule bg-white pl-10 pr-4 text-body focus:border-navy focus:outline-none"
          />
        </div>

        {/* 역할 필터 */}
        <select
          value={role}
          onChange={(e) =>
            updateQuery({
              role: e.target.value === "all" ? undefined : e.target.value,
              page: undefined,
            })
          }
          className="h-9 md:h-10 border border-rule bg-white px-3 text-body focus:border-navy focus:outline-none cursor-pointer"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* 상태 필터 */}
        <select
          value={status}
          onChange={(e) =>
            updateQuery({
              status: e.target.value === "all" ? undefined : e.target.value,
              page: undefined,
            })
          }
          className="h-9 md:h-10 border border-rule bg-white px-3 text-body focus:border-navy focus:outline-none cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Link href="/admin/members/new" className="ml-auto">
          <Button variant="primary">
            <UserPlus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">스태프 계정 생성</span>
            <span className="sm:hidden">스태프 생성</span>
          </Button>
        </Link>
      </div>

      {/* 회원 테이블 */}
      <div className="border border-rule bg-white overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-rule bg-stone">
              <th className="px-4 py-3 text-left text-body font-medium text-ink">이름</th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">학교/학년</th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">연락처</th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">역할</th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">상태</th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">가입일</th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
                  </tr>
                ))}
              </>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted">
                  회원이 없습니다
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-stone/50 transition-colors duration-200">
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{member.name}</span>
                  </td>
                  <td className="px-4 py-3 text-body text-muted">
                    {member.school
                      ? `${member.school} ${member.grade || ""}학년`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-body text-muted">
                    {formatPhoneDisplay(member.phone) || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={member.role} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {member.status && <StatusBadge status={member.status} size="sm" />}
                  </td>
                  <td className="px-4 py-3 text-body text-muted">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="text-body text-teal hover:underline"
                    >
                      상세
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default function AdminMembersPage() {
  return (
    <Suspense>
      <AdminMembersContent />
    </Suspense>
  );
}
