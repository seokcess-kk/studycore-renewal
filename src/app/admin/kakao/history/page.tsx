"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button, useToast } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import {
  getNotificationLogs,
  getNotificationStats,
} from "@/domains/notification/service";
import type {
  NotificationLogDB,
  NotificationStats,
} from "@/domains/notification/model";
import { formatPhoneDisplay } from "@/hooks/usePhoneFormat";
import {
  History,
  Filter,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Loader2,
} from "lucide-react";

type TypeFilter = "" | "sms" | "alimtalk";
type StatusFilter = "" | "sent" | "failed" | "pending";

export default function AdminKakaoHistoryPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // 필터 상태
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 데이터 상태
  const [logs, setLogs] = useState<NotificationLogDB[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const LIMIT = 20;
  const totalPages = Math.ceil(total / LIMIT);

  // 데이터 로드
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      // 로그 조회
      const logsResult = await getNotificationLogs(supabase, {
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate ? `${endDate}T23:59:59` : undefined,
        page,
        limit: LIMIT,
      });

      setLogs(logsResult.logs);
      setTotal(logsResult.total);

      // 통계 조회
      const statsResult = await getNotificationStats(supabase, {
        startDate: startDate || undefined,
        endDate: endDate ? `${endDate}T23:59:59` : undefined,
      });

      setStats(statsResult);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      showToast("데이터를 불러올 수 없습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, statusFilter, startDate, endDate, page, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 필터 초기화
  const resetFilters = () => {
    setTypeFilter("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  // 상태 뱃지
  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      sent: {
        icon: CheckCircle,
        text: "성공",
        className: "bg-teal/10 text-teal",
      },
      failed: {
        icon: XCircle,
        text: "실패",
        className: "bg-red-100 text-red-600",
      },
      pending: {
        icon: Clock,
        text: "대기",
        className: "bg-yellow-100 text-yellow-600",
      },
    }[status] || { icon: Clock, text: status, className: "bg-gray-100" };

    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-caption font-medium ${config.className}`}
      >
        <Icon size={12} />
        {config.text}
      </span>
    );
  };

  // 타입 뱃지
  const TypeBadge = ({ type }: { type: string }) => {
    const config = {
      sms: { text: "SMS", className: "bg-navy/10 text-navy" },
      alimtalk: { text: "알림톡", className: "bg-teal/10 text-teal" },
    }[type] || { text: type, className: "bg-gray-100" };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-caption font-medium ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/admin/kakao")}
                  className="p-2 hover:bg-white border border-transparent hover:border-rule transition-colors"
                >
                  <ArrowLeft size={18} className="text-muted" />
                </button>
                <h1 className="text-subhead font-medium text-ink flex items-center gap-2">
                  <History size={20} />
                  발송 이력
                </h1>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={loadData}
                disabled={isLoading}
              >
                <RefreshCw
                  size={14}
                  className={isLoading ? "animate-spin" : ""}
                />
                새로고침
              </Button>
            </div>

            {/* 통계 카드 */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-rule p-4">
                  <div className="text-small text-muted mb-1">전체</div>
                  <div className="text-2xl font-semibold text-ink">
                    {stats.total.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white border border-rule p-4">
                  <div className="text-small text-teal mb-1">성공</div>
                  <div className="text-2xl font-semibold text-teal">
                    {stats.sent.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white border border-rule p-4">
                  <div className="text-small text-red-500 mb-1">실패</div>
                  <div className="text-2xl font-semibold text-red-500">
                    {stats.failed.toLocaleString()}
                  </div>
                </div>
                <div className="bg-white border border-rule p-4">
                  <div className="text-small text-yellow-600 mb-1">대기</div>
                  <div className="text-2xl font-semibold text-yellow-600">
                    {stats.pending.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* 필터 */}
            <div className="bg-white border border-rule p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Filter size={16} className="text-muted" />
                <span className="text-secondary font-medium">필터</span>
              </div>

              <div className="flex flex-wrap gap-4">
                {/* 유형 필터 */}
                <div>
                  <label className="block text-caption text-muted mb-1">
                    유형
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      setTypeFilter(e.target.value as TypeFilter);
                      setPage(1);
                    }}
                    className="px-3 py-1.5 border border-rule text-body text-ink focus:outline-none focus:border-navy min-w-[100px]"
                  >
                    <option value="">전체</option>
                    <option value="sms">SMS</option>
                    <option value="alimtalk">알림톡</option>
                  </select>
                </div>

                {/* 상태 필터 */}
                <div>
                  <label className="block text-caption text-muted mb-1">
                    상태
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as StatusFilter);
                      setPage(1);
                    }}
                    className="px-3 py-1.5 border border-rule text-body text-ink focus:outline-none focus:border-navy min-w-[100px]"
                  >
                    <option value="">전체</option>
                    <option value="sent">성공</option>
                    <option value="failed">실패</option>
                    <option value="pending">대기</option>
                  </select>
                </div>

                {/* 시작일 */}
                <div>
                  <label className="block text-caption text-muted mb-1">
                    시작일
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-1.5 border border-rule text-body text-ink focus:outline-none focus:border-navy"
                  />
                </div>

                {/* 종료일 */}
                <div>
                  <label className="block text-caption text-muted mb-1">
                    종료일
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-1.5 border border-rule text-body text-ink focus:outline-none focus:border-navy"
                  />
                </div>

                {/* 초기화 버튼 */}
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1.5 text-small text-muted hover:text-ink transition-colors duration-200"
                  >
                    초기화
                  </button>
                </div>
              </div>
            </div>

            {/* 테이블 */}
            <div className="bg-white border border-rule overflow-hidden">
              {isLoading ? (
                <div className="p-12 text-center">
                  <Loader2 size={24} className="animate-spin mx-auto text-muted" />
                  <p className="mt-2 text-secondary text-muted">로딩 중...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageSquare size={32} className="mx-auto text-rule mb-2" />
                  <p className="text-secondary text-muted">발송 이력이 없습니다.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-stone border-b border-rule">
                        <th className="px-4 py-3 text-left text-caption font-medium text-muted uppercase tracking-wider">
                          발송일시
                        </th>
                        <th className="px-4 py-3 text-left text-caption font-medium text-muted uppercase tracking-wider">
                          유형
                        </th>
                        <th className="px-4 py-3 text-left text-caption font-medium text-muted uppercase tracking-wider">
                          수신자
                        </th>
                        <th className="px-4 py-3 text-left text-caption font-medium text-muted uppercase tracking-wider">
                          메시지
                        </th>
                        <th className="px-4 py-3 text-left text-caption font-medium text-muted uppercase tracking-wider">
                          상태
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-rule">
                      {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-stone/50 transition-colors duration-200">
                          <td className="px-4 py-3 text-small text-muted whitespace-nowrap">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <TypeBadge type={log.type} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-secondary text-ink">
                              {log.recipient_name || "-"}
                            </div>
                            <div className="text-caption text-muted">
                              {formatPhoneDisplay(log.recipient_phone)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className="text-small text-ink max-w-xs truncate"
                              title={log.message}
                            >
                              {log.message}
                            </div>
                            {log.error_message && (
                              <div className="text-caption text-red-500 mt-0.5">
                                {log.error_message}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={log.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-rule bg-stone">
                  <div className="text-small text-muted">
                    총 {total.toLocaleString()}건 중{" "}
                    {((page - 1) * LIMIT + 1).toLocaleString()}-
                    {Math.min(page * LIMIT, total).toLocaleString()}건
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 border border-rule bg-white hover:bg-stone disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="px-3 text-small">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 border border-rule bg-white hover:bg-stone disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
    </div>
  );
}
