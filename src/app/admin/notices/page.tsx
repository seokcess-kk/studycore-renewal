"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Trash2, ChevronUp, ChevronDown, Globe, Lock, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { createBrowserClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/common/Toast";
import { Badge } from "@/components/common";
import { NOTICE_CATEGORY_LABELS, NOTICE_VISIBILITY_LABELS } from "@/domains/notice/model";
import type { NoticeWithAuthor, NoticeCategory, NoticeVisibilityType } from "@/domains/notice/model";
import { updateNoticeOrders, updateNoticesVisibility } from "@/domains/notice/service";

export default function AdminNoticesPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const [notices, setNotices] = useState<NoticeWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  useEffect(() => {
    fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchNotices() {
    try {
      const { data, error } = await supabase
        .from("notices")
        .select(
          `
          *,
          author:profiles!author_id (
            name,
            avatar_url
          )
        `
        )
        .order("is_pinned", { ascending: false })
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      console.error("공지 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("notices")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;

      setNotices(notices.filter((n) => n.id !== deleteId));
      toast({
        variant: "success",
        title: "삭제 완료",
        description: "공지사항이 삭제되었습니다.",
      });
    } catch (error) {
      console.error("공지 삭제 실패:", error);
      toast({
        variant: "error",
        title: "오류",
        description: "공지사항 삭제에 실패했습니다.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= notices.length) return;

    setIsReordering(true);
    const newNotices = [...notices];
    [newNotices[index], newNotices[targetIndex]] = [newNotices[targetIndex], newNotices[index]];

    const orders = newNotices.map((n, i) => ({ id: n.id, order_index: i + 1 }));

    setNotices(newNotices);
    const result = await updateNoticeOrders(supabase, orders);
    if (!result.success) {
      toast({
        variant: "error",
        title: "오류",
        description: result.error || "순서 변경에 실패했습니다.",
      });
      await fetchNotices();
    }
    setIsReordering(false);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === notices.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notices.map((n) => n.id)));
    }
  };

  const handleBulkVisibility = async (visibility: "public" | "members_only") => {
    if (selectedIds.size === 0) return;
    setIsBulkUpdating(true);

    const ids = [...selectedIds];

    // 낙관적 업데이트
    setNotices((prev) =>
      prev.map((n) =>
        selectedIds.has(n.id) ? { ...n, visibility } : n
      )
    );

    const result = await updateNoticesVisibility(supabase, ids, visibility);

    if (result.success) {
      toast({
        variant: "success",
        description: `${ids.length}개 공지의 공개 범위를 변경했습니다.`,
      });
      setSelectedIds(new Set());
    } else {
      toast({
        variant: "error",
        title: "오류",
        description: result.error || "공개 범위 변경에 실패했습니다.",
      });
      await fetchNotices();
    }

    setIsBulkUpdating(false);
  };

  const getCategoryBadgeVariant = (category: NoticeCategory): "error" | "info" | "success" | "neutral" => {
    switch (category) {
      case "urgent":
        return "error";
      case "material":
      case "schedule":
        return "info";
      case "event":
        return "success";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6">
      {/* 상단 */}
      <div className="flex items-center justify-between">
        <p className="text-muted">총 {notices.length}개의 공지사항</p>
        <Link href="/admin/notices/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            공지 작성
          </Button>
        </Link>
      </div>

      {/* 공지 테이블 */}
      <div className="border border-rule bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-rule bg-stone">
              <th className="px-3 py-3 text-center w-10">
                <input
                  type="checkbox"
                  checked={notices.length > 0 && selectedIds.size === notices.length}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 border-rule cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 text-center text-body font-medium text-ink w-20">
                순서
              </th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">
                카테고리
              </th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">
                제목
              </th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">
                작성자
              </th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">
                조회수
              </th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">
                공개
              </th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">
                상태
              </th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">
                작성일
              </th>
              <th className="px-4 py-3 text-left text-body font-medium text-ink">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-muted">
                  로딩 중...
                </td>
              </tr>
            ) : notices.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-muted">
                  공지사항이 없습니다
                </td>
              </tr>
            ) : (
              notices.map((notice, idx) => (
                <tr
                  key={notice.id}
                  className="hover:bg-stone/50 cursor-pointer transition-colors duration-200"
                  onClick={() => router.push(`/admin/notices/${notice.id}/edit`)}
                >
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(notice.id)}
                      onChange={() => toggleSelect(notice.id)}
                      className="h-4 w-4 border-rule cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        onClick={() => handleMove(idx, "up")}
                        disabled={idx === 0 || isReordering}
                        className="p-1.5 text-muted hover:text-ink disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="위로"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleMove(idx, "down")}
                        disabled={idx === notices.length - 1 || isReordering}
                        className="p-1.5 text-muted hover:text-ink disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="아래로"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getCategoryBadgeVariant(notice.category)}>
                      {NOTICE_CATEGORY_LABELS[notice.category]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {notice.is_pinned && (
                        <span className="text-caption text-teal">[고정]</span>
                      )}
                      <span className="font-medium text-ink">
                        {notice.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-body text-muted">
                    {notice.author?.name || "알 수 없음"}
                  </td>
                  <td className="px-4 py-3 text-body text-muted">
                    {notice.view_count}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={notice.visibility === "public" ? "info" : "neutral"}>
                      {NOTICE_VISIBILITY_LABELS[(notice.visibility || "members_only") as NoticeVisibilityType]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={notice.is_published ? "success" : "neutral"}>
                      {notice.is_published ? "발행됨" : "임시저장"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-body text-muted">
                    {formatDate(notice.created_at)}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/notices/${notice.id}`}
                        target="_blank"
                        className="text-muted hover:text-ink transition-colors duration-200"
                        title="미리보기"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(notice.id)}
                        className="text-muted hover:text-red-500 transition-colors duration-200"
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="공지사항 삭제"
        description="이 공지사항을 삭제하시겠습니까? 삭제된 공지는 복구할 수 없습니다."
        confirmText="삭제"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* 다중 선택 플로팅 액션 바 */}
      {selectedIds.size > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-navy border border-white/20 px-6 py-3 flex items-center gap-4 transition-all"
          style={{ animation: "slideUp 200ms ease-out" }}
        >
          <span className="text-body font-medium text-white whitespace-nowrap">
            {selectedIds.size}개 선택됨
          </span>
          <div className="w-px h-5 bg-white/20" />
          <button
            onClick={() => handleBulkVisibility("public")}
            disabled={isBulkUpdating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-body font-medium text-white bg-white/10 hover:bg-white/20 transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            <Globe className="h-3.5 w-3.5" />
            전체 공개
          </button>
          <button
            onClick={() => handleBulkVisibility("members_only")}
            disabled={isBulkUpdating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-body font-medium text-white bg-white/10 hover:bg-white/20 transition-colors duration-200 cursor-pointer disabled:opacity-50"
          >
            <Lock className="h-3.5 w-3.5" />
            회원 공개
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="p-1.5 text-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
            title="선택 해제"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
