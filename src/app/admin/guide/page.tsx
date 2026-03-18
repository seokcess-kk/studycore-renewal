"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  FileText,
  Loader2,
  Eye,
  EyeOff,
  Clock,
  UtensilsCrossed,
  Rocket,
  Users,
  Settings,
  HelpCircle,
  BookOpen,
  BookMarked,
  GraduationCap,
  Lightbulb,
  Shield,
  Bell,
  Calendar,
  MapPin,
  Phone,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { useToast } from "@/components/common/Toast";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  getSectionList,
  createSection,
  updateSection,
  deleteSection,
} from "@/domains/guide/service";
import type { GuideSection, GuideSectionType } from "@/domains/guide/model";

// 카테고리 프리셋
const CATEGORY_PRESETS = ["시작하기", "독서실 이용", "서비스", "기타", "일반"];

// 아이콘 프리셋
const ICON_OPTIONS = [
  { name: "FileText", Icon: FileText },
  { name: "BookOpen", Icon: BookOpen },
  { name: "BookMarked", Icon: BookMarked },
  { name: "GraduationCap", Icon: GraduationCap },
  { name: "Clock", Icon: Clock },
  { name: "UtensilsCrossed", Icon: UtensilsCrossed },
  { name: "Rocket", Icon: Rocket },
  { name: "Users", Icon: Users },
  { name: "Settings", Icon: Settings },
  { name: "HelpCircle", Icon: HelpCircle },
  { name: "Lightbulb", Icon: Lightbulb },
  { name: "Shield", Icon: Shield },
  { name: "Bell", Icon: Bell },
  { name: "Calendar", Icon: Calendar },
  { name: "MapPin", Icon: MapPin },
  { name: "Phone", Icon: Phone },
] as const;

function getIconComponent(name: string) {
  const found = ICON_OPTIONS.find((o) => o.name === name);
  return found?.Icon || FileText;
}

interface FormData {
  title: string;
  content: string;
  content_html: string;
  category: string;
  customCategory: string;
  icon: string;
  is_visible: boolean;
}

const INITIAL_FORM: FormData = {
  title: "",
  content: "",
  content_html: "",
  category: "일반",
  customCategory: "",
  icon: "FileText",
  is_visible: true,
};

export default function AdminGuidePage() {
  const supabase = createBrowserClient();
  const { showToast } = useToast();

  const [sections, setSections] = useState<GuideSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeType, setActiveType] = useState<GuideSectionType>("onboarding");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

  // 섹션 목록 조회
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeType]);

  // 유효 카테고리 (프리셋 + 직접 입력)
  const resolvedCategory =
    formData.category === "__custom__"
      ? formData.customCategory.trim() || "일반"
      : formData.category;

  // 섹션 추가
  const handleAdd = async () => {
    if (!formData.title || (!formData.content && !formData.content_html)) {
      showToast("제목과 내용을 입력해주세요.", "error");
      return;
    }

    setIsSubmitting(true);
    const result = await createSection(supabase, {
      title: formData.title,
      content: formData.content || formData.title,
      type: activeType,
      category: resolvedCategory,
      icon: formData.icon,
      content_html: formData.content_html || null,
    });

    if (result.success) {
      showToast("섹션이 추가되었습니다.", "success");
      setFormData(INITIAL_FORM);
      setShowAddForm(false);
      await fetchSections();
    } else {
      showToast(result.error || "섹션 추가에 실패했습니다.", "error");
    }
    setIsSubmitting(false);
  };

  // 수정 모드 진입
  const handleEdit = (section: GuideSection) => {
    const isCustom = !CATEGORY_PRESETS.includes(section.category || "일반");
    setEditingId(section.id);
    setFormData({
      title: section.title,
      content: section.content,
      content_html: section.content_html || "",
      category: isCustom ? "__custom__" : (section.category || "일반"),
      customCategory: isCustom ? (section.category || "") : "",
      icon: section.icon || "FileText",
      is_visible: section.is_visible,
    });
  };

  // 섹션 수정
  const handleSaveEdit = async () => {
    if (!editingId || !formData.title) {
      showToast("제목을 입력해주세요.", "error");
      return;
    }

    setIsSubmitting(true);
    const result = await updateSection(supabase, editingId, {
      title: formData.title,
      content: formData.content || formData.title,
      category: resolvedCategory,
      icon: formData.icon,
      content_html: formData.content_html || null,
      is_visible: formData.is_visible,
    });

    if (result.success) {
      showToast("섹션이 수정되었습니다.", "success");
      setEditingId(null);
      setFormData(INITIAL_FORM);
      await fetchSections();
    } else {
      showToast(result.error || "섹션 수정에 실패했습니다.", "error");
    }
    setIsSubmitting(false);
  };

  // 섹션 삭제
  const handleDelete = async () => {
    if (!deleteId) return;
    setIsSubmitting(true);
    const result = await deleteSection(supabase, deleteId);
    if (result.success) {
      showToast("섹션이 삭제되었습니다.", "success");
      setDeleteId(null);
      await fetchSections();
    } else {
      showToast(result.error || "섹션 삭제에 실패했습니다.", "error");
    }
    setIsSubmitting(false);
  };

  // 표시/숨김 토글
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

  // 취소
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
  };

  // 폼 UI (추가/수정 공용)
  const renderForm = (mode: "add" | "edit") => (
    <div className="border border-rule bg-white p-6 space-y-4">
      <h3 className="font-serif text-lg font-bold text-ink">
        {mode === "add" ? "새 섹션 추가" : "섹션 수정"}
      </h3>

      {/* 제목 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-muted">제목</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
          placeholder="섹션 제목"
          disabled={isSubmitting}
        />
      </div>

      {/* 카테고리 + 아이콘 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">카테고리</label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none bg-white"
            disabled={isSubmitting}
          >
            {CATEGORY_PRESETS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__custom__">직접 입력</option>
          </select>
          {formData.category === "__custom__" && (
            <input
              type="text"
              value={formData.customCategory}
              onChange={(e) =>
                setFormData({ ...formData, customCategory: e.target.value })
              }
              className="mt-2 w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
              placeholder="카테고리명 입력"
              disabled={isSubmitting}
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-muted">아이콘</label>
          <div className="flex flex-wrap gap-1.5">
            {ICON_OPTIONS.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setFormData({ ...formData, icon: name })}
                className={`p-2 border transition-colors ${
                  formData.icon === name
                    ? "border-teal bg-teal/10 text-teal"
                    : "border-rule text-muted hover:text-ink hover:border-ink"
                }`}
                title={name}
                disabled={isSubmitting}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 표시/숨김 토글 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted">표시 상태</label>
        <button
          type="button"
          onClick={() =>
            setFormData({ ...formData, is_visible: !formData.is_visible })
          }
          className={`flex items-center gap-2 px-3 py-1.5 border text-sm transition-colors ${
            formData.is_visible
              ? "border-teal text-teal bg-teal/5"
              : "border-rule text-muted"
          }`}
          disabled={isSubmitting}
        >
          {formData.is_visible ? (
            <>
              <Eye size={14} /> 표시
            </>
          ) : (
            <>
              <EyeOff size={14} /> 숨김
            </>
          )}
        </button>
      </div>

      {/* 리치 텍스트 에디터 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-muted">내용</label>
        <RichTextEditor
          content={formData.content_html}
          onChange={(html) => {
            // content_html 저장 + 플레인텍스트 fallback용 content도 동기화
            const div = document.createElement("div");
            div.innerHTML = html;
            const plainText = div.textContent || div.innerText || "";
            setFormData({
              ...formData,
              content_html: html,
              content: plainText.trim() || formData.title,
            });
          }}
          placeholder="섹션 내용을 입력하세요..."
        />
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button
          variant="primary"
          onClick={mode === "add" ? handleAdd : handleSaveEdit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "add" ? "추가 중..." : "저장 중..."}
            </>
          ) : mode === "add" ? (
            "추가"
          ) : (
            "저장"
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 타입 탭 */}
      <div className="flex border-b border-rule">
        <button
          onClick={() => {
            setActiveType("onboarding");
            handleCancel();
          }}
          className={`px-4 py-3 text-[14px] font-medium border-b-2 transition-colors ${
            activeType === "onboarding"
              ? "border-navy text-navy"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          조교 온보딩
        </button>
        <button
          onClick={() => {
            setActiveType("manual");
            handleCancel();
          }}
          className={`px-4 py-3 text-[14px] font-medium border-b-2 transition-colors ${
            activeType === "manual"
              ? "border-navy text-navy"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          재원생 매뉴얼
        </button>
      </div>

      {/* 상단 */}
      <div className="flex items-center justify-between">
        <p className="text-muted text-[14px]">
          {activeType === "onboarding"
            ? "조교 온보딩 문서를 관리합니다. /guide에 표시됩니다."
            : "재원생 이용 매뉴얼을 관리합니다. /manual에 표시됩니다."}
        </p>
        <Button
          variant="primary"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm || !!editingId}
        >
          <Plus className="mr-2 h-4 w-4" />
          섹션 추가
        </Button>
      </div>

      {/* 새 섹션 추가 폼 */}
      {showAddForm && renderForm("add")}

      {/* 섹션 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="border border-rule bg-white py-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted" />
            <p className="mt-4 text-muted">로딩 중...</p>
          </div>
        ) : sections.length === 0 ? (
          <div className="border border-rule bg-white py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted" />
            <p className="mt-4 text-muted">등록된 문서가 없습니다.</p>
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="border border-rule bg-white p-6">
              {editingId === section.id ? (
                renderForm("edit")
              ) : (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 cursor-move text-muted" />
                      <span className="font-mono text-sm text-muted">
                        #{section.order_index}
                      </span>
                      {(() => {
                        const SIcon = getIconComponent(section.icon || "FileText");
                        return <SIcon size={16} className="text-teal" />;
                      })()}
                      <h3 className="font-serif font-bold text-ink">
                        {section.title}
                      </h3>
                      {section.category && section.category !== "일반" && (
                        <span className="text-xs bg-teal/10 text-teal px-1.5 py-0.5">
                          {section.category}
                        </span>
                      )}
                      {!section.is_visible && (
                        <span className="text-xs bg-stone text-muted px-1.5 py-0.5">
                          숨김
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleVisibility(section)}
                        className="text-muted hover:text-ink"
                        title={section.is_visible ? "숨기기" : "표시하기"}
                        disabled={isSubmitting || showAddForm || !!editingId}
                      >
                        {section.is_visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-muted hover:text-ink"
                        disabled={isSubmitting || showAddForm || !!editingId}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(section.id)}
                        className="text-muted hover:text-red-500"
                        disabled={isSubmitting || showAddForm || !!editingId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {section.content_html ? (
                    <div
                      className="prose prose-sm max-w-none text-muted prose-headings:font-serif prose-a:text-teal"
                      dangerouslySetInnerHTML={{ __html: section.content_html }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-muted line-clamp-3">
                      {section.content}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
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
      />
    </div>
  );
}
