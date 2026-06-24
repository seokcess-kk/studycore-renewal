"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/common/Button";
import { FormError } from "@/components/common";
import {
  createLandingSchema,
  generateLandingSlug,
  MAX_LANDING_HTML_BYTES,
  type CreateLandingInput,
} from "@/domains/landing/model";

interface LandingFormProps {
  defaultValues?: Partial<CreateLandingInput>;
  onSubmit: (data: CreateLandingInput) => Promise<void>;
}

/** 랜딩페이지 생성/수정 공통 폼 (HTML 파일 업로드 + slug + 활성) */
export function LandingForm({ defaultValues, onSubmit }: LandingFormProps) {
  const [htmlContent, setHtmlContent] = useState(defaultValues?.html_content ?? "");
  const [fileName, setFileName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateLandingInput>({
    resolver: zodResolver(createLandingSchema),
    defaultValues: {
      slug: defaultValues?.slug ?? "",
      name: defaultValues?.name ?? "",
      html_content: defaultValues?.html_content ?? "",
      is_active: defaultValues?.is_active ?? true,
    },
  });

  const slugValue = useWatch({ control, name: "slug" });
  const nameValue = useWatch({ control, name: "name" });

  const applyHtml = (text: string, name?: string) => {
    setHtmlContent(text);
    setValue("html_content", text, { shouldValidate: true });
    if (name !== undefined) setFileName(name);
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LANDING_HTML_BYTES) {
      alert("HTML 파일은 2MB 이하만 업로드 가능합니다.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => applyHtml(String(reader.result ?? ""), file.name);
    reader.readAsText(file);
    e.target.value = "";
  };

  const suggestSlug = () => {
    if (!nameValue) return;
    setValue("slug", generateLandingSlug(nameValue), { shouldValidate: true });
  };

  const htmlKB = htmlContent
    ? (new Blob([htmlContent]).size / 1024).toFixed(1)
    : null;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/landings"
          className="flex items-center gap-2 text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>
        <Button
          variant="primary"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </div>

      <form className="space-y-6">
        {/* 기본 정보 */}
        <div className="border border-rule bg-white p-4 md:p-6 space-y-4">
          <div>
            <label className="mb-1 block text-body font-medium text-muted">
              이름 (관리용) *
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="2026 썸머스쿨"
              className="input-admin"
            />
            <FormError message={errors.name?.message} />
          </div>

          <div>
            <label className="mb-1 block text-body font-medium text-muted">
              슬러그 (URL) *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                {...register("slug")}
                placeholder="summer-2026"
                className="input-admin flex-1"
              />
              <button
                type="button"
                onClick={suggestSlug}
                className="shrink-0 border border-rule px-3 text-caption text-muted hover:bg-stone cursor-pointer transition-colors"
              >
                이름에서 생성
              </button>
            </div>
            <FormError message={errors.slug?.message} />
            <p className="mt-1 text-caption text-muted">
              광고 주소:{" "}
              <span className="font-mono text-ink">
                /landing/{slugValue || "슬러그"}
              </span>{" "}
              · 영문 소문자·숫자·하이픈만
            </p>
          </div>
        </div>

        {/* HTML */}
        <div className="border border-rule bg-white p-4 md:p-6 space-y-4">
          <h3 className="font-medium text-ink">랜딩 HTML *</h3>
          <div>
            <label className="inline-flex items-center gap-2 border border-rule px-3 py-2 text-body text-ink hover:bg-stone cursor-pointer transition-colors">
              <Upload className="h-4 w-4" />
              HTML 파일 선택
              <input
                type="file"
                accept=".html,text/html"
                onChange={handleFile}
                className="hidden"
              />
            </label>
            {fileName && (
              <span className="ml-2 text-caption text-muted">{fileName}</span>
            )}
          </div>
          <div>
            <label className="mb-1 block text-caption text-muted">
              또는 HTML 직접 붙여넣기
            </label>
            <textarea
              value={htmlContent}
              onChange={(e) => applyHtml(e.target.value)}
              rows={10}
              placeholder="<!DOCTYPE html> ..."
              className="input-admin resize-none font-mono text-caption"
            />
            <div className="mt-1 flex items-center justify-between gap-2">
              <FormError message={errors.html_content?.message} />
              {htmlKB && (
                <span className="shrink-0 text-caption text-muted">{htmlKB} KB</span>
              )}
            </div>
          </div>
        </div>

        {/* 설정 */}
        <div className="border border-rule bg-white p-4 md:p-6 space-y-4">
          <h3 className="font-medium text-ink">설정</h3>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              {...register("is_active")}
              className="h-4 w-4 border-rule"
            />
            <label
              htmlFor="is_active"
              className="text-body text-ink cursor-pointer"
            >
              활성화 (URL 공개)
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
