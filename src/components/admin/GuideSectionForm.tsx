"use client";

import { useForm } from "react-hook-form";
import {
  FileText,
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
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { FileAttachmentManager } from "@/components/admin/FileAttachmentManager";
import type {
  GuideAttachment,
  GuideSection,
  GuideSectionType,
} from "@/domains/guide/model";

const CATEGORY_PRESETS = ["시작하기", "독서실 이용", "서비스", "기타", "일반"];

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

export interface GuideSectionFormValues {
  title: string;
  content: string;
  content_html: string | null;
  category: string;
  customCategory: string;
  icon: string;
  is_visible: boolean;
  attachments: GuideAttachment[];
}

const FORM_DEFAULTS: GuideSectionFormValues = {
  title: "",
  content: "",
  content_html: null,
  category: "일반",
  customCategory: "",
  icon: "FileText",
  is_visible: true,
  attachments: [],
};

interface GuideSectionFormProps {
  mode: "add" | "edit";
  section?: GuideSection;
  sectionType: GuideSectionType;
  onSubmit: (data: GuideSectionFormValues) => Promise<void>;
  onCancel: () => void;
}

export function GuideSectionForm({
  mode,
  section,
  onSubmit,
  onCancel,
}: GuideSectionFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<GuideSectionFormValues>({
    defaultValues: section
      ? {
          title: section.title,
          content: section.content,
          content_html: section.content_html || null,
          category: !CATEGORY_PRESETS.includes(section.category || "일반")
            ? "__custom__"
            : section.category || "일반",
          customCategory: !CATEGORY_PRESETS.includes(section.category || "일반")
            ? section.category || ""
            : "",
          icon: section.icon || "FileText",
          is_visible: section.is_visible,
          attachments: section.attachments || [],
        }
      : FORM_DEFAULTS,
  });

  const watchCategory = watch("category");
  const watchIcon = watch("icon");
  const watchIsVisible = watch("is_visible");
  const watchContentHtml = watch("content_html");
  const watchAttachments = watch("attachments");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl space-y-5"
    >
      {/* 제목 */}
      <div>
        <label className="mb-1 block text-body font-medium text-muted">제목</label>
        <input
          type="text"
          {...register("title")}
          className="input-admin w-full"
          placeholder="섹션 제목"
          disabled={isSubmitting}
        />
      </div>

      {/* 카테고리 + 아이콘 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-body font-medium text-muted">카테고리</label>
          <select
            {...register("category")}
            className="input-admin w-full bg-white"
            disabled={isSubmitting}
          >
            {CATEGORY_PRESETS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__custom__">직접 입력</option>
          </select>
          {watchCategory === "__custom__" && (
            <input
              type="text"
              {...register("customCategory")}
              className="input-admin mt-2 w-full"
              placeholder="카테고리명 입력"
              disabled={isSubmitting}
            />
          )}
        </div>
        <div>
          <label className="mb-1 block text-body font-medium text-muted">아이콘</label>
          <div className="flex flex-wrap gap-1.5">
            {ICON_OPTIONS.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setValue("icon", name)}
                className={`p-2 border transition-colors duration-200 cursor-pointer ${
                  watchIcon === name
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
        <label className="text-body font-medium text-muted">표시 상태</label>
        <button
          type="button"
          onClick={() => setValue("is_visible", !watchIsVisible)}
          className={`flex items-center gap-2 px-3 py-1.5 border text-body transition-colors duration-200 cursor-pointer ${
            watchIsVisible
              ? "border-teal text-teal bg-teal/5"
              : "border-rule text-muted"
          }`}
          disabled={isSubmitting}
        >
          {watchIsVisible ? (
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
        <label className="mb-1 block text-body font-medium text-muted">내용</label>
        <RichTextEditor
          content={watchContentHtml || ""}
          onChange={(html) => {
            const div = document.createElement("div");
            div.innerHTML = html;
            const plainText = div.textContent || div.innerText || "";
            setValue("content_html", html);
            setValue("content", plainText.trim() || watch("title"));
          }}
          placeholder="섹션 내용을 입력하세요..."
        />
      </div>

      {/* 첨부파일 */}
      <div>
        <label className="mb-1 block text-body font-medium text-muted">첨부파일</label>
        <FileAttachmentManager
          sectionId={section?.id}
          value={watchAttachments || []}
          onChange={(attachments) => setValue("attachments", attachments)}
          disabled={isSubmitting}
        />
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          취소
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
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
    </form>
  );
}

export { CATEGORY_PRESETS, ICON_OPTIONS };
