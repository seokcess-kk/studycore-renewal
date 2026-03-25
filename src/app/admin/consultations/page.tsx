"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronDown, ChevronUp, Phone, Trash2 } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { Badge, Pagination } from "@/components/common";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import {
  getConsultationList,
  changeConsultationStatus,
  deleteConsultation,
} from "@/domains/consultation/service";
import type {
  Consultation,
  ConsultationStatusType,
} from "@/domains/consultation/model";
import { formatDistanceToNow } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  new: "신규",
  contacted: "연락함",
  done: "완료",
};

const STATUS_BADGE_VARIANT: Record<string, "warning" | "info" | "success"> = {
  new: "warning",
  contacted: "info",
  done: "success",
};

const CONSULT_TYPE_LABELS: Record<string, string> = {
  admission: "등록 상담",
  tour: "시설 견학",
  program: "프로그램 문의",
  etc: "기타",
};

export default function AdminConsultationsPage() {
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 15;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getConsultationList(supabase, {
        status: statusFilter || undefined,
        page,
        pageSize,
      });
      setConsultations(result.consultations);
      setTotal(result.total);
    } catch {
      toast({ variant: "error", description: "상담 목록 로드 실패" });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, statusFilter, page, pageSize, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (
    id: string,
    newStatus: ConsultationStatusType
  ) => {
    const result = await changeConsultationStatus(supabase, id, newStatus);
    if (result.success) {
      toast({ variant: "success", description: "상태가 변경되었습니다." });
      fetchData();
    } else {
      toast({ variant: "error", description: result.error || "상태 변경 실패" });
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    const result = await deleteConsultation(supabase, deleteTargetId);
    if (result.success) {
      toast({ variant: "success", description: "삭제되었습니다." });
      fetchData();
    } else {
      toast({ variant: "error", description: result.error || "삭제 실패" });
    }
    setIsDeleting(false);
    setDeleteTargetId(null);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* 필터 */}
      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
        >
          <option value="">전체 상태</option>
          <option value="new">신규</option>
          <option value="contacted">연락함</option>
          <option value="done">완료</option>
        </select>
        <span className="text-sm text-muted">총 {total}건</span>
      </div>

      {/* 목록 */}
      <div className="border border-rule bg-white overflow-x-auto">
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-[1fr_120px_120px_100px_120px_50px] gap-4 border-b border-rule px-4 py-3 text-xs font-medium text-muted bg-stone min-w-[640px]">
          <span>이름 / 연락처</span>
          <span>상담 유형</span>
          <span>상태</span>
          <span>신청일</span>
          <span>상태 변경</span>
          <span>삭제</span>
        </div>

        {isLoading ? (
          <div className="px-4 py-12 text-center text-muted">로딩 중...</div>
        ) : consultations.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted">
            상담 신청이 없습니다.
          </div>
        ) : (
          consultations.map((c) => (
            <div key={c.id} className="border-b border-rule last:border-b-0">
              <div className="grid grid-cols-[1fr_120px_120px_100px_120px_50px] items-center gap-4 px-4 py-3 min-w-[640px]">
                {/* 이름 + 연락처 + 확장 토글 */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === c.id ? null : c.id)
                  }
                  className="flex items-center gap-2 text-left"
                >
                  <Phone className="h-4 w-4 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-ink">{c.name}</p>
                    <p className="text-xs text-muted">{c.phone}</p>
                    {c.school && (
                      <p className="text-xs text-muted">{c.school}</p>
                    )}
                  </div>
                  {c.message && (
                    expandedId === c.id ? (
                      <ChevronUp className="ml-auto h-4 w-4 text-muted" />
                    ) : (
                      <ChevronDown className="ml-auto h-4 w-4 text-muted" />
                    )
                  )}
                </button>

                {/* 유형 */}
                <span className="text-sm text-ink">
                  {CONSULT_TYPE_LABELS[c.consult_type] || c.consult_type}
                </span>

                {/* 상태 */}
                <Badge variant={STATUS_BADGE_VARIANT[c.status]}>
                  {STATUS_LABELS[c.status]}
                </Badge>

                {/* 날짜 */}
                <span className="text-xs text-muted">
                  {formatDistanceToNow(c.created_at)}
                </span>

                {/* 상태 변경 드롭다운 */}
                <select
                  value={c.status}
                  onChange={(e) =>
                    handleStatusChange(
                      c.id,
                      e.target.value as ConsultationStatusType
                    )
                  }
                  className="border border-rule px-2 py-1 text-xs focus:border-navy focus:outline-none"
                >
                  <option value="new">신규</option>
                  <option value="contacted">연락함</option>
                  <option value="done">완료</option>
                </select>

                {/* 삭제 */}
                <button
                  onClick={() => setDeleteTargetId(c.id)}
                  className="flex items-center justify-center text-muted hover:text-red-500 cursor-pointer transition-colors duration-200"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* 메시지 확장 */}
              {expandedId === c.id && c.message && (
                <div className="border-t border-rule bg-stone px-6 py-4">
                  <p className="text-xs font-medium text-muted mb-1">문의 내용</p>
                  <p className="whitespace-pre-wrap text-sm text-ink">
                    {c.message}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} variant="simple" />
      )}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="상담 신청 삭제"
        description="이 상담 신청을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
