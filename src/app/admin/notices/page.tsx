"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Eye, Trash2, GripVertical, Globe, Lock, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { createBrowserClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/common/Toast";
import { Badge } from "@/components/common";
import { NOTICE_CATEGORY_LABELS, NOTICE_VISIBILITY_LABELS } from "@/domains/notice/model";
import type { NoticeWithAuthor, NoticeCategory, NoticeVisibilityType } from "@/domains/notice/model";
import { updateNoticeOrders, updateNoticesVisibility } from "@/domains/notice/service";

/* ── 드래그 가능한 테이블 행 ── */
function SortableNoticeRow({
  notice,
  selectedIds,
  toggleSelect,
  getCategoryBadgeVariant,
  setDeleteId,
  onRowClick,
}: {
  notice: NoticeWithAuthor;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  getCategoryBadgeVariant: (c: NoticeCategory) => "error" | "info" | "success" | "neutral";
  setDeleteId: (id: string) => void;
  onRowClick: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: notice.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-stone/50 cursor-pointer transition-colors duration-200 bg-white"
      onClick={() => onRowClick(notice.id)}
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
        <div className="flex items-center justify-center">
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 text-muted hover:text-ink cursor-grab active:cursor-grabbing transition-colors"
            title="드래그하여 순서 변경"
          >
            <GripVertical className="h-4 w-4" />
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
            className="text-muted hover:text-red-500 transition-colors duration-200 cursor-pointer"
            title="삭제"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminNoticesPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const [notices, setNotices] = useState<NoticeWithAuthor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = notices.findIndex((n) => n.id === active.id);
    const newIndex = notices.findIndex((n) => n.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(notices, oldIndex, newIndex);
    setNotices(reordered);

    const orders = reordered.map((n, i) => ({ id: n.id, order_index: i + 1 }));
    const result = await updateNoticeOrders(supabase, orders);
    if (!result.success) {
      toast({
        variant: "error",
        title: "오류",
        description: result.error || "순서 변경에 실패했습니다.",
      });
      await fetchNotices();
    }
  }, [notices, supabase, toast]);

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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
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
                <th className="px-3 py-3 text-center text-body font-medium text-ink w-12">
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
                <SortableContext
                  items={notices.map((n) => n.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {notices.map((notice) => (
                    <SortableNoticeRow
                      key={notice.id}
                      notice={notice}
                      selectedIds={selectedIds}
                      toggleSelect={toggleSelect}
                      getCategoryBadgeVariant={getCategoryBadgeVariant}
                      setDeleteId={setDeleteId}
                      onRowClick={(id) => router.push(`/admin/notices/${id}/edit`)}
                    />
                  ))}
                </SortableContext>
              )}
            </tbody>
          </table>
        </div>

        {/* 드래그 오버레이 */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-white border border-brand px-4 py-3 text-body font-medium text-ink">
              {notices.find((n) => n.id === activeId)?.title || ""}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
