"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Paperclip, X, FileText, Layers } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/common/Button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { useUserStore } from "@/stores/useUserStore";
import {
  createNoticeSchema,
  NOTICE_CATEGORY_LABELS,
} from "@/domains/notice/model";
import { createNotice, addNoticeAttachment } from "@/domains/notice/service";
import { createPopup } from "@/domains/popup/service";
import { z } from "zod";

type CreateNoticeInput = z.infer<typeof createNoticeSchema>;

export default function AdminNoticeNewPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const { user } = useUserStore();

  const [isPinned, setIsPinned] = useState(false);
  const [registerAsPopup, setRegisterAsPopup] = useState(false);
  const [popupDays, setPopupDays] = useState(7);
  const [attachments, setAttachments] = useState<{ name: string; url: string; size: number; type: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateNoticeInput>({
    resolver: zodResolver(createNoticeSchema),
    defaultValues: {
      category: "general",
      content: "",
      is_published: true,
    },
  });

  const contentValue = watch("content");

  const onSubmit = async (data: CreateNoticeInput, publish: boolean = true) => {
    if (!user) return;

    try {
      const result = await createNotice(supabase, user.id, {
        ...data,
        is_published: publish,
        is_pinned: isPinned,
      });

      if (!result.success) throw new Error(result.error);

      // 첨부파일 연결
      if (result.notice && attachments.length > 0) {
        for (const att of attachments) {
          await addNoticeAttachment(supabase, {
            notice_id: result.notice.id,
            file_name: att.name,
            file_url: att.url,
            file_size: att.size,
            file_type: att.type,
          });
        }
      }

      // 팝업 등록
      if (registerAsPopup && publish && result.notice) {
        const imageAtt = attachments.find((a) => a.type.startsWith("image/"));
        const today = new Date().toISOString().split("T")[0];
        const endDate = new Date(Date.now() + popupDays * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        const popupResult = await createPopup(supabase, {
          title: data.title,
          content: data.content.replace(/<[^>]*>/g, "").trim().slice(0, 200),
          image_url: imageAtt?.url || null,
          notice_id: result.notice.id,
          start_date: today,
          end_date: endDate,
          is_active: true,
          sort_order: 0,
        });

        if (popupResult.success) {
          toast({
            variant: "success",
            title: "발행 + 팝업 등록 완료",
            description: "공지사항이 발행되고 팝업이 등록되었습니다.",
          });
        } else {
          toast({
            variant: "success",
            title: "발행 완료 (팝업 등록 실패)",
            description: "공지사항은 발행되었으나 팝업 등록에 실패했습니다.",
          });
        }
      } else {
        toast({
          variant: "success",
          title: publish ? "발행 완료" : "임시저장 완료",
          description: publish
            ? "공지사항이 발행되었습니다."
            : "공지사항이 임시저장되었습니다.",
        });
      }

      router.push("/admin/notices");
    } catch (error) {
      console.error("공지 저장 실패:", error);
      toast({
        variant: "error",
        title: "오류",
        description: "공지사항 저장에 실패했습니다.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 상단 */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/notices"
          className="flex items-center gap-2 text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            임시저장
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "저장 중..." : "발행"}
          </Button>
        </div>
      </div>

      {/* 폼 */}
      <form className="space-y-6">
        <div className="border border-rule bg-white p-6">
          <div className="space-y-4">
            {/* 카테고리 + 고정 */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-muted">
                  카테고리
                </label>
                <select
                  {...register("category")}
                  className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
                >
                  {Object.entries(NOTICE_CATEGORY_LABELS).map(
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4 border-rule"
                />
                <label htmlFor="isPinned" className="text-sm text-ink">
                  상단 고정
                </label>
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                제목
              </label>
              <input
                type="text"
                {...register("title")}
                placeholder="공지사항 제목을 입력하세요"
                className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* 내용 */}
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                내용
              </label>
              <RichTextEditor
                content={contentValue || ""}
                onChange={(html) => setValue("content", html, { shouldValidate: true })}
                placeholder="공지사항 내용을 입력하세요"
              />
              {errors.content && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.content.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 첨부파일 */}
        <div className="border border-rule bg-white p-6">
          <h3 className="mb-4 font-medium text-ink">첨부파일</h3>

          {/* 업로드 버튼 */}
          <label className="inline-flex cursor-pointer items-center gap-2 border border-rule px-4 py-2 text-sm text-muted hover:border-navy hover:text-ink transition-colors">
            <Paperclip className="h-4 w-4" />
            {isUploading ? "업로드 중..." : "파일 첨부"}
            <input
              type="file"
              multiple
              disabled={isUploading}
              className="hidden"
              onChange={async (e) => {
                const files = e.target.files;
                if (!files || files.length === 0) return;
                setIsUploading(true);
                try {
                  for (const file of Array.from(files)) {
                    if (file.size > 10 * 1024 * 1024) {
                      toast({ variant: "error", description: `${file.name}: 10MB 이하만 업로드 가능합니다.` });
                      continue;
                    }
                    const fileId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
                    const ext = file.name.split(".").pop() || "bin";
                    const path = `attachments/${fileId}.${ext}`;

                    const { error: uploadError } = await supabase.storage
                      .from("notice-attachments")
                      .upload(path, file, { contentType: file.type });

                    if (uploadError) {
                      toast({ variant: "error", description: `${file.name} 업로드 실패` });
                      continue;
                    }

                    const { data: urlData } = supabase.storage
                      .from("notice-attachments")
                      .getPublicUrl(path);

                    setAttachments((prev) => [
                      ...prev,
                      { name: file.name, url: urlData.publicUrl, size: file.size, type: file.type },
                    ]);
                  }
                } finally {
                  setIsUploading(false);
                  e.target.value = "";
                }
              }}
            />
          </label>

          {/* 첨부 파일 목록 */}
          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border border-rule px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 flex-shrink-0 text-muted" />
                    <span className="truncate text-sm text-ink">{att.name}</span>
                    <span className="flex-shrink-0 text-xs text-muted">
                      ({(att.size / 1024).toFixed(0)}KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const path = att.url.split("notice-attachments/")[1];
                      if (path) {
                        await supabase.storage.from("notice-attachments").remove([path]);
                      }
                      setAttachments((prev) => prev.filter((_, i) => i !== idx));
                    }}
                    className="flex-shrink-0 p-1 text-muted hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="mt-3 text-xs text-muted">
            최대 10MB, 여러 파일 첨부 가능
          </p>
        </div>

        {/* 팝업 등록 */}
        <div className="border border-rule bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <Layers className="h-5 w-5 text-teal" />
            <h3 className="font-medium text-ink">팝업 등록</h3>
          </div>
          <label className="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              checked={registerAsPopup}
              onChange={(e) => setRegisterAsPopup(e.target.checked)}
              className="h-4 w-4 border-rule"
            />
            <span className="text-sm text-ink">
              발행 시 홈페이지 팝업으로 함께 등록
            </span>
          </label>
          {registerAsPopup && (
            <div className="ml-6 space-y-2">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted">노출 기간:</label>
                <select
                  value={popupDays}
                  onChange={(e) => setPopupDays(Number(e.target.value))}
                  className="border border-rule px-2 py-1 text-sm focus:border-navy focus:outline-none"
                >
                  <option value={3}>3일</option>
                  <option value={7}>7일</option>
                  <option value={14}>14일</option>
                  <option value={30}>30일</option>
                </select>
              </div>
              <p className="text-xs text-muted">
                첨부 이미지가 있으면 팝업 이미지로 자동 사용됩니다.
              </p>
            </div>
          )}
        </div>

        {/* 알림톡 발송 옵션 */}
        <div className="border border-rule bg-white p-6">
          <h3 className="mb-4 font-medium text-ink">알림톡 발송 (선택)</h3>
          <div className="space-y-2 text-sm text-muted">
            <label className="flex items-center gap-2">
              <input type="radio" name="alimtalk" value="none" defaultChecked />
              발송 안 함
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="alimtalk" value="students" />
              재원생 전체
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="alimtalk" value="parents" />
              재원생 + 학부모
            </label>
          </div>
          <p className="mt-3 text-xs text-muted">
            * 발행 후 수동으로 알림톡을 발송할 수 있습니다.
          </p>
        </div>
      </form>
    </div>
  );
}
