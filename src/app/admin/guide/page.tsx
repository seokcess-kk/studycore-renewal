"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Loader2,
  Eye,
  EyeOff,
  Edit,
  ChevronDown,
  Paperclip,
  BookOpen,
  BookMarked,
  GraduationCap,
  Clock,
  UtensilsCrossed,
  Rocket,
  Users,
  Settings,
  HelpCircle,
  Lightbulb,
  Shield,
  Bell,
  Calendar,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/common/Toast";
import { createBrowserClient } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import {
  getSectionList,
  updateSection,
  deleteSection,
} from "@/domains/guide/service";
import type { GuideSection, GuideSectionType } from "@/domains/guide/model";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileText, BookOpen, BookMarked, GraduationCap, Clock,
  UtensilsCrossed, Rocket, Users, Settings, HelpCircle,
  Lightbulb, Shield, Bell, Calendar, MapPin, Phone,
};

function getIcon(name: string) {
  return ICON_MAP[name] || FileText;
}

export default function AdminGuidePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient();
  const { showToast } = useToast();
  const { canAccessAdmin } = useUserStore();

  const [sections, setSections] = useState<GuideSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeType = (searchParams.get("type") || "onboarding") as GuideSectionType;

  const setActiveType = (type: GuideSectionType) => {
    router.push(`/admin/guide?type=${type}`);
  };

  const fetchSections = async () => {
    setIsLoading(true);
    const result = await getSectionList(supabase, activeType);
    if (result.success) {
      setSections(result.sections);
    } else {
      showToast(result.error || "섹션 목록을 불러오지 못했습니다.", "error");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSections();
    setExpandedId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType]);

  const handleToggleVisibility = async (section: GuideSection) => {
    const result = await updateSection(supabase, section.id, {
      is_visible: !section.is_visible,
    });
    if (result.success) {
      showToast(
        section.is_visible ? "섹션이 숨김 처리되었습니다." : "섹션이 표시됩니다.",
        "success"
      );
      await fetchSections();
    } else {
      showToast("상태 변경에 실패했습니다.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    const result = await deleteSection(supabase, deleteId);
    if (result.success) {
      showToast("섹션이 삭제되었습니다.", "success");
      setDeleteId(null);
      if (expandedId === deleteId) setExpandedId(null);
      await fetchSections();
    } else {
      showToast(result.error || "섹션 삭제에 실패했습니다.", "error");
    }
    setIsDeleting(false);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* 타입 탭 */}
      <div className="flex border-b border-rule">
        <button
          onClick={() => setActiveType("onboarding")}
          className={cn(
            "px-4 py-3 text-body font-medium border-b-2 transition-colors duration-200 cursor-pointer",
            activeType === "onboarding"
              ? "border-navy text-navy"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          조교 온보딩
        </button>
        <button
          onClick={() => setActiveType("manual")}
          className={cn(
            "px-4 py-3 text-body font-medium border-b-2 transition-colors duration-200 cursor-pointer",
            activeType === "manual"
              ? "border-navy text-navy"
              : "border-transparent text-muted hover:text-ink"
          )}
        >
          재원생 매뉴얼
        </button>
      </div>

      {/* 상단 */}
      <div className="flex items-center justify-between">
        <p className="text-muted text-body">
          {activeType === "onboarding"
            ? "조교 온보딩 문서를 관리합니다."
            : "재원생 이용 매뉴얼을 관리합니다."}
        </p>
        {canAccessAdmin && (
          <Link href={`/admin/guide/new?type=${activeType}`}>
            <Button variant="primary">
              <Plus className="mr-2 h-4 w-4" />
              섹션 추가
            </Button>
          </Link>
        )}
      </div>

      {/* 섹션 아코디언 리스트 */}
      <div className="border border-rule bg-white divide-y divide-rule">
        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted" />
            <p className="mt-4 text-muted">로딩 중...</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted" />
            <p className="mt-4 text-muted">등록된 문서가 없습니다.</p>
          </div>
        ) : (
          sections.map((section) => {
            const Icon = getIcon(section.icon || "FileText");
            const isExpanded = expandedId === section.id;

            return (
              <div key={section.id}>
                {/* 헤더 행 */}
                <div
                  className="flex items-center gap-3 px-4 py-3 hover:bg-stone/50 transition-colors duration-200 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : section.id)}
                >
                  <GripVertical className="h-4 w-4 text-muted flex-shrink-0" />
                  <span className="font-mono text-caption text-muted w-6 text-right flex-shrink-0">
                    {section.order_index}
                  </span>
                  <Icon size={16} className="text-teal flex-shrink-0" />
                  <span className="text-body font-medium text-ink truncate flex-1">
                    {section.title}
                  </span>

                  {/* 뱃지들 */}
                  {section.category && section.category !== "일반" && (
                    <span className="text-caption bg-teal/10 text-teal px-1.5 py-0.5 flex-shrink-0">
                      {section.category}
                    </span>
                  )}
                  {!section.is_visible && (
                    <span className="text-caption bg-stone text-muted px-1.5 py-0.5 flex-shrink-0">
                      숨김
                    </span>
                  )}
                  {section.attachments && section.attachments.length > 0 && (
                    <span className="flex items-center gap-1 text-caption bg-navy/5 text-navy px-1.5 py-0.5 flex-shrink-0">
                      <Paperclip size={10} />
                      {section.attachments.length}
                    </span>
                  )}

                  {/* 액션 버튼 (admin만) */}
                  {canAccessAdmin && (
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(section);
                        }}
                        className="p-1 text-muted hover:text-ink transition-colors duration-200 cursor-pointer"
                        title={section.is_visible ? "숨기기" : "표시하기"}
                      >
                        {section.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <Link
                        href={`/admin/guide/${section.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 text-muted hover:text-ink transition-colors duration-200 cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(section.id);
                        }}
                        className="p-1 text-muted hover:text-red-500 transition-colors duration-200 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted transition-transform duration-200 flex-shrink-0",
                      isExpanded && "rotate-180"
                    )}
                  />
                </div>

                {/* 펼침 영역 — 콘텐츠 미리보기 */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-rule bg-stone/30">
                    {section.content_html ? (
                      <div
                        className="prose prose-sm max-w-none text-muted prose-headings:font-serif prose-a:text-teal"
                        dangerouslySetInnerHTML={{ __html: section.content_html }}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-muted text-body">
                        {section.content}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="섹션 삭제"
        description="이 섹션을 삭제하시겠습니까?"
        confirmText="삭제"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
