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
import { getSpaceList, deleteSpace } from "@/domains/space/service";
import type { Space } from "@/domains/space/model";

export default function AdminSpacesPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getSpaceList(supabase, { page, pageSize });
      setSpaces(result.spaces);
      setTotal(result.total);
    } catch {
      toast({ variant: "error", description: "공간 목록 로드 실패" });
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
    const result = await deleteSpace(supabase, deleteTargetId);
    if (result.success) {
      toast({ variant: "success", description: "공간이 삭제되었습니다." });
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
        <Link href="/admin/spaces/new">
          <Button variant="primary" size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            공간 등록
          </Button>
        </Link>
      </div>

      <div className="border border-rule bg-white overflow-x-auto">
        <div className="grid grid-cols-[60px_60px_120px_1fr_80px_60px] gap-4 border-b border-rule px-4 py-3 text-xs font-medium text-muted bg-stone min-w-[560px]">
          <span>순서</span>
          <span>이미지</span>
          <span>라벨</span>
          <span>제목</span>
          <span>상태</span>
          <span>삭제</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted">로딩 중...</div>
        ) : spaces.length === 0 ? (
          <div className="py-12 text-center text-muted">등록된 공간이 없습니다.</div>
        ) : (
          spaces.map((s) => (
            <div
              key={s.id}
              className="grid grid-cols-[60px_60px_120px_1fr_80px_60px] items-center gap-4 border-b border-rule px-4 py-3 last:border-b-0 cursor-pointer hover:bg-stone/50 transition-colors duration-200 min-w-[560px]"
              onClick={() => router.push(`/admin/spaces/${s.id}/edit`)}
            >
              <span className="text-xs text-muted font-mono">{s.sort_order}</span>
              <div className="w-8 h-8 bg-stone border border-rule overflow-hidden flex-shrink-0">
                {s.image_url ? (
                  <img src={s.image_url} alt={s.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-navy/10" />
                )}
              </div>
              <span className="text-xs text-muted font-mono truncate">{s.label}</span>
              <p className="truncate text-sm font-medium text-ink">{s.title}</p>
              <Badge variant={s.is_active ? "success" : "neutral"}>
                {s.is_active ? "활성" : "비활성"}
              </Badge>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTargetId(s.id); }}
                className="flex items-center text-muted hover:text-red-500 transition-colors duration-200 cursor-pointer"
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
        title="공간 삭제"
        description="이 공간을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
