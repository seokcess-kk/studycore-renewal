"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/common/Button";
import { ImageUploader } from "@/components/common/ImageUploader";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import { createPopupSchema, type CreatePopupInput } from "@/domains/popup/model";
import { createPopup } from "@/domains/popup/service";

interface NoticeOption {
  id: string;
  title: string;
  content: string;
}

interface NoticeAttachment {
  file_url: string;
  file_type: string | null;
}

export default function AdminPopupNewPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [notices, setNotices] = useState<NoticeOption[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreatePopupInput>({
    resolver: zodResolver(createPopupSchema),
    defaultValues: {
      is_active: true,
      sort_order: 0,
      link_text: "자세히 보기",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    },
  });

  const noticeId = watch("notice_id");

  useEffect(() => {
    async function loadNotices() {
      const { data } = await supabase
        .from("notices")
        .select("id, title, content")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(50);
      setNotices(data || []);
    }
    loadNotices();
  }, [supabase]);

  const handleNoticeSelect = async (selectedNoticeId: string) => {
    if (selectedNoticeId) {
      const notice = notices.find((n) => n.id === selectedNoticeId);
      if (notice) {
        setValue("notice_id", selectedNoticeId);
        setValue("title", notice.title);
        // HTML 태그 제거하여 팝업 내용으로 설정
        const plainContent = notice.content.replace(/<[^>]*>/g, "").trim();
        setValue("content", plainContent.slice(0, 200));

        // 공지 첨부파일 중 이미지 가져오기
        const { data: attachments } = await supabase
          .from("notice_attachments")
          .select("file_url, file_type")
          .eq("notice_id", selectedNoticeId);

        const imageAtt = (attachments || []).find(
          (a: NoticeAttachment) => a.file_type?.startsWith("image/")
        );
        if (imageAtt) {
          setImageUrls([imageAtt.file_url]);
        }
      }
    } else {
      setValue("notice_id", null);
      setValue("content", "");
      setImageUrls([]);
    }
  };

  const onSubmit = async (data: CreatePopupInput) => {
    const result = await createPopup(supabase, {
      ...data,
      image_url: imageUrls[0] || null,
      link_url: data.link_url || null,
      notice_id: data.notice_id || null,
    });

    if (result.success) {
      toast({ variant: "success", description: "팝업이 생성되었습니다." });
      router.push("/admin/popups");
    } else {
      toast({ variant: "error", description: result.error || "생성 실패" });
    }
  };

  return (
    <div className="container-content space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/popups"
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
        {/* 공지사항 연결 */}
        <div className="border border-rule bg-white p-6">
          <h3 className="mb-4 font-medium text-ink">공지사항 연결 (선택)</h3>
          <select
            value={noticeId || ""}
            onChange={(e) => handleNoticeSelect(e.target.value)}
            className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
          >
            <option value="">직접 작성</option>
            {notices.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-muted">
            공지사항을 선택하면 팝업 클릭 시 해당 공지로 이동합니다.
          </p>
        </div>

        {/* 기본 정보 */}
        <div className="border border-rule bg-white p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              제목 *
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="팝업 제목"
              className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              내용
            </label>
            <textarea
              {...register("content")}
              rows={4}
              placeholder="팝업 내용 (선택)"
              className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              이미지
            </label>
            <ImageUploader
              bucket="popups"
              folder="images"
              maxFiles={1}
              maxSizeMB={2}
              value={imageUrls}
              onChange={setImageUrls}
            />
          </div>
        </div>

        {/* 링크 */}
        {!noticeId && (
          <div className="border border-rule bg-white p-6 space-y-4">
            <h3 className="font-medium text-ink">링크 설정</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                링크 URL
              </label>
              <input
                type="text"
                {...register("link_url")}
                placeholder="https://..."
                className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
              {errors.link_url && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.link_url.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                링크 텍스트
              </label>
              <input
                type="text"
                {...register("link_text")}
                placeholder="자세히 보기"
                className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 기간 + 활성 */}
        <div className="border border-rule bg-white p-6 space-y-4">
          <h3 className="font-medium text-ink">노출 설정</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                시작일 *
              </label>
              <input
                type="date"
                {...register("start_date")}
                className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
              {errors.start_date && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.start_date.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                종료일 *
              </label>
              <input
                type="date"
                {...register("end_date")}
                className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
              {errors.end_date && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              {...register("is_active")}
              className="h-4 w-4 border-rule"
            />
            <label htmlFor="is_active" className="text-sm text-ink">
              활성화
            </label>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              정렬 순서
            </label>
            <input
              type="number"
              {...register("sort_order", { valueAsNumber: true })}
              className="w-32 border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
