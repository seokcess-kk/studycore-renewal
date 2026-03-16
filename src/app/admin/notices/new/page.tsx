"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
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
import { z } from "zod";

type CreateNoticeInput = z.infer<typeof createNoticeSchema>;

export default function AdminNoticeNewPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const { user } = useUserStore();

  const [isPinned, setIsPinned] = useState(false);

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
      const { error } = await supabase.from("notices").insert({
        ...data,
        is_published: publish,
        is_pinned: isPinned,
        author_id: user.id,
      });

      if (error) throw error;

      toast({
        variant: "success",
        title: publish ? "발행 완료" : "임시저장 완료",
        description: publish
          ? "공지사항이 발행되었습니다."
          : "공지사항이 임시저장되었습니다.",
      });

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
