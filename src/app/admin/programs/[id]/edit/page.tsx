"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/common/Button";
import { ImageUploader } from "@/components/common/ImageUploader";
import { createBrowserClient } from "@/lib/supabase/client";
import { useToast } from "@/components/common/Toast";
import {
  createProgramSchema,
  type CreateProgramInput,
} from "@/domains/program/model";
import { getProgramDetail, updateProgram } from "@/domains/program/service";

export default function AdminProgramEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProgramInput>({
    resolver: zodResolver(createProgramSchema),
  });

  useEffect(() => {
    async function load() {
      const result = await getProgramDetail(supabase, id);
      if (result.success && result.program) {
        const p = result.program;
        reset({
          title: p.title,
          description: p.description,
          start_date: p.start_date || undefined,
          end_date: p.end_date || undefined,
          is_active: p.is_active,
          sort_order: p.sort_order,
        });
        if (p.image_url) setImageUrls([p.image_url]);
      } else {
        toast({ variant: "error", description: "프로그램을 찾을 수 없습니다." });
        router.push("/admin/programs");
      }
      setIsLoadingData(false);
    }
    load();
  }, [supabase, id, reset, router, toast]);

  const onSubmit = async (data: CreateProgramInput) => {
    const result = await updateProgram(supabase, id, {
      ...data,
      image_url: imageUrls[0] || null,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    });

    if (result.success) {
      toast({ variant: "success", description: "프로그램이 수정되었습니다." });
      router.push("/admin/programs");
    } else {
      toast({ variant: "error", description: result.error || "수정 실패" });
    }
  };

  if (isLoadingData) {
    return <div className="py-12 text-center text-muted">로딩 중...</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/programs"
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
        <div className="border border-rule bg-white p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              프로그램명 *
            </label>
            <input
              type="text"
              {...register("title")}
              className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              설명
            </label>
            <textarea
              {...register("description")}
              rows={8}
              placeholder={"프로그램 상세 설명을 입력하세요.\n\n줄바꿈으로 내용을 구분하면 상세 보기에서 그대로 표시됩니다."}
              className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none resize-none"
            />
            <p className="mt-1 text-xs text-muted">
              &apos;- &apos;로 시작하는 줄 → 홈 카드 불릿 (최대 4개) · 나머지 → 상세 팝업에서만 표시
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              대표 이미지
            </label>
            <ImageUploader
              bucket="programs"
              folder="images"
              maxFiles={1}
              maxSizeMB={2}
              value={imageUrls}
              onChange={setImageUrls}
            />
          </div>
        </div>

        <div className="border border-rule bg-white p-6 space-y-4">
          <h3 className="font-medium text-ink">기간 및 설정</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                시작일
              </label>
              <input
                type="date"
                {...register("start_date")}
                className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">
                종료일
              </label>
              <input
                type="date"
                {...register("end_date")}
                className="w-full border border-rule px-3 py-2 text-sm focus:border-navy focus:outline-none"
              />
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
              활성화 (홈페이지에 표시)
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
