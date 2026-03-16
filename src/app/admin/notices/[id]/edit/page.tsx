"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/common/Button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import {
  updateNoticeSchema,
  NOTICE_CATEGORY_LABELS,
} from "@/domains/notice/model";
import { z } from "zod";
import type { Notice } from "@/domains/notice/model";

type UpdateNoticeInput = z.infer<typeof updateNoticeSchema>;

export default function AdminNoticeEditPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPinned, setIsPinned] = useState(false);

  const noticeId = params.id as string;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateNoticeInput>({
    resolver: zodResolver(updateNoticeSchema),
  });

  const contentValue = watch("content");

  useEffect(() => {
    async function fetchNotice() {
      try {
        const { data, error } = await supabase
          .from("notices")
          .select("*")
          .eq("id", noticeId)
          .single();

        if (error) throw error;

        setNotice(data);
        setIsPinned(data.is_pinned);
        reset({
          title: data.title,
          content: data.content,
          category: data.category,
        });
      } catch (error) {
        console.error("공지 조회 실패:", error);
        toast({
          variant: "error",
          title: "오류",
          description: "공지사항을 불러올 수 없습니다.",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchNotice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noticeId]);

  const onSubmit = async (data: UpdateNoticeInput, publish?: boolean) => {
    try {
      const updateData: Record<string, unknown> = {
        ...data,
        is_pinned: isPinned,
      };

      if (publish !== undefined) {
        updateData.is_published = publish;
      }

      const { error } = await supabase
        .from("notices")
        .update(updateData)
        .eq("id", noticeId);

      if (error) throw error;

      toast({
        variant: "success",
        title: "저장 완료",
        description: "공지사항이 수정되었습니다.",
      });

      router.push("/admin/notices");
    } catch (error) {
      console.error("공지 수정 실패:", error);
      toast({
        variant: "error",
        title: "오류",
        description: "공지사항 수정에 실패했습니다.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin border-2 border-navy border-t-transparent" />
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">공지사항을 찾을 수 없습니다.</p>
        <Link href="/admin/notices" className="mt-4 text-teal hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

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
          {notice.is_published ? (
            <Button
              variant="ghost"
              onClick={handleSubmit((data) => onSubmit(data, false))}
              disabled={isSubmitting}
            >
              비공개로 전환
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={handleSubmit((data) => onSubmit(data))}
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              임시저장
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? "저장 중..." : notice.is_published ? "저장" : "발행"}
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

        {/* 공지 정보 */}
        <div className="border border-rule bg-white p-6">
          <h3 className="mb-4 font-medium text-ink">공지 정보</h3>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">조회수</dt>
              <dd className="font-medium text-ink">{notice.view_count}</dd>
            </div>
            <div>
              <dt className="text-muted">상태</dt>
              <dd className="font-medium text-ink">
                {notice.is_published ? "발행됨" : "임시저장"}
              </dd>
            </div>
          </dl>
        </div>
      </form>
    </div>
  );
}
