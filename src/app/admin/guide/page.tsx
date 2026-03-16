"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, GripVertical, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/common/Toast";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  getSectionList,
  createSection,
  updateSection,
  deleteSection,
} from "@/domains/guide/service";
import type { GuideSection, GuideSectionType } from "@/domains/guide/model";

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

  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });

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

  // 섹션 추가
  const handleAdd = async () => {
    if (!formData.title || !formData.content) {
      showToast("제목과 내용을 입력해주세요.", "error");
      return;
    }

    setIsSubmitting(true);
    const result = await createSection(supabase, {
      title: formData.title,
      content: formData.content,
      type: activeType,
    });

    if (result.success) {
      showToast("섹션이 추가되었습니다.", "success");
      setFormData({ title: "", content: "" });
      setShowAddForm(false);
      await fetchSections();
    } else {
      showToast(result.error || "섹션 추가에 실패했습니다.", "error");
    }
    setIsSubmitting(false);
  };

  // 수정 모드 진입
  const handleEdit = (section: GuideSection) => {
    setEditingId(section.id);
    setFormData({ title: section.title, content: section.content });
  };

  // 섹션 수정
  const handleSaveEdit = async () => {
    if (!editingId || !formData.title || !formData.content) {
      showToast("제목과 내용을 입력해주세요.", "error");
      return;
    }

    setIsSubmitting(true);
    const result = await updateSection(supabase, editingId, {
      title: formData.title,
      content: formData.content,
    });

    if (result.success) {
      showToast("섹션이 수정되었습니다.", "success");
      setEditingId(null);
      setFormData({ title: "", content: "" });
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

  // 취소
  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ title: "", content: "" });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 타입 탭 */}
      <div className="flex border-b border-rule">
        <button
          onClick={() => { setActiveType("onboarding"); handleCancel(); }}
          className={`px-4 py-3 text-[14px] font-medium border-b-2 transition-colors ${
            activeType === "onboarding"
              ? "border-navy text-navy"
              : "border-transparent text-muted hover:text-ink"
          }`}
        >
          조교 온보딩
        </button>
        <button
          onClick={() => { setActiveType("manual"); handleCancel(); }}
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
      {showAddForm && (
        <div className="border border-rule bg-white p-6">
          <h3 className="mb-4 font-serif text-lg font-bold text-ink">
            새 섹션 추가
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                제목
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
                placeholder="섹션 제목"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                내용
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={5}
                className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
                placeholder="섹션 내용"
                disabled={isSubmitting}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleAdd}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    추가 중...
                  </>
                ) : (
                  "추가"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

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
            <p className="mt-4 text-muted">등록된 온보딩 문서가 없습니다.</p>
          </div>
        ) : (
          sections.map((section) => (
            <div
              key={section.id}
              className="border border-rule bg-white p-6"
            >
              {editingId === section.id ? (
                /* 수정 모드 */
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-muted">
                      제목
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-muted">
                      내용
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={5}
                      className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                    >
                      취소
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSaveEdit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        "저장"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* 보기 모드 */
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 cursor-move text-muted" />
                      <span className="font-mono text-sm text-muted">
                        #{section.order_index}
                      </span>
                      <h3 className="font-serif font-bold text-ink">
                        {section.title}
                      </h3>
                      {!section.is_visible && (
                        <span className="text-xs bg-stone text-muted px-1.5 py-0.5">
                          숨김
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-muted hover:text-ink"
                        disabled={isSubmitting || showAddForm}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(section.id)}
                        className="text-muted hover:text-red-500"
                        disabled={isSubmitting || showAddForm}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap text-muted">
                    {section.content}
                  </p>
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
