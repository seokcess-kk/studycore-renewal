"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/common/Button";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { Badge, Pagination } from "@/components/common";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { getLandingList, deleteLanding } from "@/domains/landing/service";
import type { Landing } from "@/domains/landing/model";

export default function AdminLandingsPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const [landings, setLandings] = useState<Landing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getLandingList(supabase, { page, pageSize });
      setLandings(result.landings);
      setTotal(result.total);
    } catch {
      toast({ variant: "error", description: "랜딩페이지 목록 로드 실패" });
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
    const result = await deleteLanding(supabase, deleteTargetId);
    if (result.success) {
      toast({ variant: "success", description: "랜딩페이지가 삭제되었습니다." });
      fetchData();
    } else {
      toast({ variant: "error", description: result.error || "삭제 실패" });
    }
    setIsDeleting(false);
    setDeleteTargetId(null);
  };

  const copyUrl = async (slug: string) => {
    const url = `${window.location.origin}/landing/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ variant: "success", description: "광고용 URL이 복사되었습니다." });
    } catch {
      toast({ variant: "error", description: `복사 실패 — ${url}` });
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-body text-muted">총 {total}건</span>
        <Link href="/admin/landings/new">
          <Button variant="primary" size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            랜딩페이지 등록
          </Button>
        </Link>
      </div>

      <div className="border border-rule bg-white overflow-x-auto">
        <div className="grid grid-cols-[1fr_160px_72px_150px_48px] gap-4 border-b border-rule px-4 py-3 text-caption font-medium text-muted bg-stone min-w-[720px]">
          <span>이름</span>
          <span>슬러그</span>
          <span>상태</span>
          <span>광고 URL</span>
          <span>삭제</span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted">로딩 중...</div>
        ) : landings.length === 0 ? (
          <div className="py-12 text-center text-muted">
            등록된 랜딩페이지가 없습니다.
          </div>
        ) : (
          landings.map((l) => (
            <div
              key={l.id}
              className="grid grid-cols-[1fr_160px_72px_150px_48px] items-center gap-4 border-b border-rule px-4 py-3 last:border-b-0 min-w-[720px]"
            >
              <button
                onClick={() => router.push(`/admin/landings/${l.id}/edit`)}
                className="truncate text-left text-body font-medium text-ink hover:text-navy cursor-pointer transition-colors"
              >
                {l.name}
              </button>
              <span className="truncate font-mono text-caption text-muted">
                {l.slug}
              </span>
              <Badge variant={l.is_active ? "success" : "neutral"}>
                {l.is_active ? "활성" : "비활성"}
              </Badge>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyUrl(l.slug)}
                  className="flex items-center gap-1 text-caption text-muted hover:text-navy cursor-pointer transition-colors"
                  title="광고용 URL 복사"
                >
                  <Copy className="h-3.5 w-3.5" />
                  URL 복사
                </button>
                <a
                  href={`/landing/${l.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-muted hover:text-navy cursor-pointer transition-colors"
                  title="미리보기"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <button
                onClick={() => setDeleteTargetId(l.id)}
                className="flex items-center text-muted hover:text-red-500 cursor-pointer transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          variant="simple"
        />
      )}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="랜딩페이지 삭제"
        description="이 랜딩페이지를 삭제하시겠습니까? 광고에 사용 중이면 링크가 깨집니다. 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
