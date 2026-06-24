"use client";

import { Fragment, useEffect, useState, useCallback } from "react";
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
import { formatPhoneDisplay } from "@/hooks/usePhoneFormat";

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

// 유입 경로(source) → 어드민 표시 라벨. homepage 외 값은 광고 캠페인.
const SOURCE_LABELS: Record<string, string> = {
  lp_studycore_summer_2026: "썸머스쿨 광고",
};

// utm 상세(확장 영역) 표시용 라벨
const UTM_LABELS: Record<string, string> = {
  utm_source: "소스",
  utm_medium: "매체",
  utm_campaign: "캠페인",
  utm_content: "콘텐츠",
  utm_term: "검색어",
  fbclid: "FB 클릭ID",
  landing_page_id: "랜딩 ID",
  inflow_url: "유입 URL",
  product: "상품",
};

/** 유입 경로 라벨 (homepage가 아니면 캠페인 라벨 또는 "광고") */
function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? "광고";
}

/** utm 객체에서 값이 있는 항목만 라벨·값 쌍으로 추출 */
function utmEntries(
  utm: Record<string, unknown> | null
): Array<{ label: string; value: string }> {
  if (!utm) return [];
  return Object.entries(utm)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => ({ label: UTM_LABELS[k] ?? k, value: String(v) }));
}

export default function AdminConsultationsPage() {
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<"" | "homepage" | "ad">("");
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
        source: sourceFilter || undefined,
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
  }, [supabase, statusFilter, sourceFilter, page, pageSize, toast]);

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
          className="border border-rule px-3 py-2 text-body focus:border-navy focus:outline-none"
        >
          <option value="">전체 상태</option>
          <option value="new">신규</option>
          <option value="contacted">연락함</option>
          <option value="done">완료</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value as "" | "homepage" | "ad");
            setPage(1);
          }}
          className="border border-rule px-3 py-2 text-body focus:border-navy focus:outline-none"
        >
          <option value="">전체 유입</option>
          <option value="ad">광고 유입</option>
          <option value="homepage">홈페이지</option>
        </select>
        <span className="text-body text-muted">총 {total}건</span>
      </div>

      {/* 목록 */}
      <div className="border border-rule bg-white overflow-x-auto">
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-[1fr_104px_104px_92px_88px_104px_44px] gap-4 border-b border-rule px-4 py-3 text-caption font-medium text-muted bg-stone min-w-[760px]">
          <span>이름 / 연락처</span>
          <span>유입</span>
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
              <div className="grid grid-cols-[1fr_104px_104px_92px_88px_104px_44px] items-center gap-4 px-4 py-3 min-w-[760px]">
                {/* 이름 + 연락처 + 확장 토글 */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === c.id ? null : c.id)
                  }
                  className="flex items-center gap-2 text-left"
                >
                  <Phone className="h-4 w-4 text-muted shrink-0" />
                  <div>
                    <p className="text-body font-medium text-ink">{c.name}</p>
                    <p className="text-caption text-muted">{formatPhoneDisplay(c.phone)}</p>
                    {(c.school || c.grade) && (
                      <p className="text-caption text-muted">
                        {[c.school, c.grade].filter(Boolean).join(" ")}
                      </p>
                    )}
                  </div>
                  {(c.message || c.source !== "homepage") && (
                    expandedId === c.id ? (
                      <ChevronUp className="ml-auto h-4 w-4 text-muted" />
                    ) : (
                      <ChevronDown className="ml-auto h-4 w-4 text-muted" />
                    )
                  )}
                </button>

                {/* 유입 */}
                {c.source === "homepage" ? (
                  <span className="text-caption text-muted">홈페이지</span>
                ) : (
                  <span>
                    <Badge variant="warning">{sourceLabel(c.source)}</Badge>
                  </span>
                )}

                {/* 유형 */}
                <span className="text-body text-ink">
                  {CONSULT_TYPE_LABELS[c.consult_type] || c.consult_type}
                </span>

                {/* 상태 */}
                <Badge variant={STATUS_BADGE_VARIANT[c.status]}>
                  {STATUS_LABELS[c.status]}
                </Badge>

                {/* 날짜 */}
                <span className="text-caption text-muted">
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
                  className="border border-rule px-2 py-1 text-caption focus:border-navy focus:outline-none"
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

              {/* 문의 내용 + 광고 유입 상세 확장 */}
              {expandedId === c.id && (c.message || c.source !== "homepage") && (
                <div className="border-t border-rule bg-stone px-6 py-4 space-y-3">
                  {c.message && (
                    <div>
                      <p className="text-caption font-medium text-muted mb-1">문의 내용</p>
                      <p className="whitespace-pre-wrap text-body text-ink">
                        {c.message}
                      </p>
                    </div>
                  )}
                  {c.source !== "homepage" && (
                    <div>
                      <p className="text-caption font-medium text-muted mb-1.5">유입 상세</p>
                      <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-1">
                        {utmEntries(c.utm).map((e) => (
                          <Fragment key={e.label}>
                            <dt className="text-caption text-muted">{e.label}</dt>
                            <dd className="text-caption text-ink break-all">{e.value}</dd>
                          </Fragment>
                        ))}
                        <dt className="text-caption text-muted">마케팅 수신</dt>
                        <dd className="text-caption text-ink">
                          {c.marketing_consent ? "동의" : "미동의"}
                        </dd>
                      </dl>
                    </div>
                  )}
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
