"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/common/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { createBrowserClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import type { Profile, UserRoleType, UserStatusType } from "@/domains/user/model";

type FilterRole = UserRoleType | "all";
type FilterStatus = UserStatusType | "all";

export default function AdminMembersPage() {
  const supabase = createBrowserClient();
  const [members, setMembers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<FilterRole>("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  useEffect(() => {
    async function fetchMembers() {
      setIsLoading(true);
      try {
        let query = supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (filterRole !== "all") {
          query = query.eq("role", filterRole);
        }

        if (filterStatus !== "all") {
          query = query.eq("status", filterStatus);
        }

        if (search) {
          query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        setMembers(data || []);
      } catch (error) {
        console.error("회원 목록 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembers();
  }, [supabase, search, filterRole, filterStatus]);

  return (
    <div className="space-y-6">
      {/* 상단 액션 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="이름, 전화번호 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-64 border border-rule bg-white pl-10 pr-4 text-sm focus:border-navy focus:outline-none"
            />
          </div>

          {/* 역할 필터 */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as FilterRole)}
            className="h-10 border border-rule bg-white px-3 text-sm focus:border-navy focus:outline-none"
          >
            <option value="all">모든 역할</option>
            <option value="student">재원생</option>
            <option value="assistant">조교</option>
            <option value="mentor">멘토</option>
            <option value="admin">관리자</option>
          </select>

          {/* 상태 필터 */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="h-10 border border-rule bg-white px-3 text-sm focus:border-navy focus:outline-none"
          >
            <option value="all">모든 상태</option>
            <option value="pending">승인 대기</option>
            <option value="active">활성</option>
            <option value="inactive">비활성</option>
          </select>
        </div>

        <Link href="/admin/members/new">
          <Button variant="primary">
            <UserPlus className="mr-2 h-4 w-4" />
            스태프 계정 생성
          </Button>
        </Link>
      </div>

      {/* 회원 테이블 */}
      <div className="border border-rule bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-rule bg-stone">
              <th className="px-4 py-3 text-left text-sm font-medium text-ink">
                이름
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-ink">
                학교/학년
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-ink">
                연락처
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-ink">
                역할
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-ink">
                상태
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-ink">
                가입일
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-ink">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted">
                  로딩 중...
                </td>
              </tr>
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
                  <td className="px-4 py-3 text-sm text-muted">
                    {member.school
                      ? `${member.school} ${member.grade || ""}학년`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {member.phone || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={member.role} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    {member.status && <StatusBadge status={member.status} size="sm" />}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {formatDate(member.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/members/${member.id}`}
                      className="text-sm text-teal hover:underline"
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
    </div>
  );
}
