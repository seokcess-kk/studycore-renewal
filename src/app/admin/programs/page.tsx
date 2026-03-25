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
import { getProgramList, deleteProgram } from "@/domains/program/service";
import type { Program } from "@/domains/program/model";

export default function AdminProgramsPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getProgramList(supabase, { page, pageSize });
      setPrograms(result.programs);
      setTotal(result.total);
    } catch {
      toast({ variant: "error", description: "프로그램 목록 로드 실패" });
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
    const result = await deleteProgram(supabase, deleteTargetId);
    if (result.success) {
      toast({ variant: "success", description: "프로그램이 삭제되었습니다." });
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
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">총 {total}건</span>
        <Link href="/admin/programs/new">
          <Button variant="primary" size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            프로그램 등록
          </Button>
        </Link>
      </div>

      <div className="border border-rule bg-white overflow-x-auto">
        <div className="grid grid-cols-[1fr_80px_140px_140px_80px] gap-4 border-b border-rule px-4 py-3 text-xs font-medium text-muted bg-stone min-w-[640px]">
          <span>제목</span>
          <span>상태</span>
          <span>시작일</span>
          <span>종료일</span>
          <span>삭제</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted">로딩 중...</div>
        ) : programs.length === 0 ? (
          <div className="py-12 text-center text-muted">등록된 프로그램이 없습니다.</div>
        ) : (
          programs.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[1fr_80px_140px_140px_80px] items-center gap-4 border-b border-rule px-4 py-3 last:border-b-0 cursor-pointer hover:bg-stone/50 transition-colors min-w-[640px]"
              onClick={() => router.push(`/admin/programs/${p.id}/edit`)}
            >
              <p className="truncate text-sm font-medium text-ink">{p.title}</p>
              <Badge variant={p.is_active ? "success" : "neutral"}>
                {p.is_active ? "활성" : "비활성"}
              </Badge>
              <span className="text-xs text-muted">
                {p.start_date
                  ? new Date(p.start_date).toLocaleDateString("ko-KR")
                  : "-"}
              </span>
              <span className="text-xs text-muted">
                {p.end_date
                  ? new Date(p.end_date).toLocaleDateString("ko-KR")
                  : "-"}
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
        title="프로그램 삭제"
        description="이 프로그램을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
