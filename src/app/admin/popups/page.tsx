"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { Badge, Pagination } from "@/components/common";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { getPopupList, deletePopup } from "@/domains/popup/service";
import type { Popup } from "@/domains/popup/model";

export default function AdminPopupsPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const [popups, setPopups] = useState<Popup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPopupList(supabase, { page, pageSize });
      setPopups(result.popups);
      setTotal(result.total);
    } catch {
      toast({ variant: "error", description: "팝업 목록 로드 실패" });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, page, pageSize, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    const result = await deletePopup(supabase, deleteTargetId);
    if (result.success) {
      toast({ variant: "success", description: "팝업이 삭제되었습니다." });
      fetchData();
    } else {
      toast({ variant: "error", description: result.error || "삭제 실패" });
    }
    setIsDeleting(false);
    setDeleteTargetId(null);
  };

  const isActive = (p: Popup) => {
    const now = new Date();
    return p.is_active && new Date(p.start_date) <= now && new Date(p.end_date) >= now;
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">총 {total}건</span>
        <Link href="/admin/popups/new">
          <Button variant="primary" size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            팝업 생성
          </Button>
        </Link>
      </div>

      <div className="border border-rule bg-white overflow-x-auto">
        <div className="grid grid-cols-[1fr_100px_140px_140px_80px] gap-4 border-b border-rule px-4 py-3 text-xs font-medium text-muted bg-stone min-w-[640px]">
          <span>제목</span>
          <span>상태</span>
          <span>시작일</span>
          <span>종료일</span>
          <span>삭제</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted">로딩 중...</div>
        ) : popups.length === 0 ? (
          <div className="py-12 text-center text-muted">등록된 팝업이 없습니다.</div>
        ) : (
          popups.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[1fr_100px_140px_140px_80px] items-center gap-4 border-b border-rule px-4 py-3 last:border-b-0 cursor-pointer hover:bg-stone/50 transition-colors min-w-[640px]"
              onClick={() => router.push(`/admin/popups/${p.id}/edit`)}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                {p.notice_id && (
                  <p className="text-xs text-teal">공지 연결됨</p>
                )}
              </div>
              <Badge variant={isActive(p) ? "success" : "neutral"}>
                {isActive(p) ? "노출중" : "비활성"}
              </Badge>
              <span className="text-xs text-muted">
                {new Date(p.start_date).toLocaleDateString("ko-KR")}
              </span>
              <span className="text-xs text-muted">
                {new Date(p.end_date).toLocaleDateString("ko-KR")}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTargetId(p.id); }}
                className="flex items-center text-muted hover:text-red-500 transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} variant="simple" />
      )}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="팝업 삭제"
        description="이 팝업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
