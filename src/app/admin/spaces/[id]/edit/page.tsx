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
import { FormError } from "@/components/common";
import {
  createSpaceSchema,
  type CreateSpaceInput,
} from "@/domains/space/model";
import { getSpaceDetail, updateSpace } from "@/domains/space/service";

export default function AdminSpaceEditPage() {
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
  } = useForm<CreateSpaceInput>({
    resolver: zodResolver(createSpaceSchema),
  });

  useEffect(() => {
    async function load() {
      const result = await getSpaceDetail(supabase, id);
      if (result.success && result.space) {
        const s = result.space;
        reset({
          label: s.label,
          title: s.title,
          description: s.description,
          is_active: s.is_active,
          sort_order: s.sort_order,
        });
        if (s.image_url) setImageUrls([s.image_url]);
      } else {
        toast({ variant: "error", description: "공간을 찾을 수 없습니다." });
        router.push("/admin/spaces");
      }
      setIsLoadingData(false);
    }
    load();
  }, [supabase, id, reset, router, toast]);

  const onSubmit = async (data: CreateSpaceInput) => {
    const result = await updateSpace(supabase, id, {
      ...data,
      image_url: imageUrls[0] || null,
    });

    if (result.success) {
      toast({ variant: "success", description: "공간이 수정되었습니다." });
      router.push("/admin/spaces");
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
          href="/admin/spaces"
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
              라벨 (영문) *
            </label>
            <input
              type="text"
              {...register("label")}
              placeholder="Main Hall"
              className="input-admin"
            />
            <FormError message={errors.label?.message} />
            <p className="mt-1 text-xs text-muted">
              슬라이더 하단에 표시되는 영문 라벨
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              제목 *
            </label>
            <input
              type="text"
              {...register("title")}
              placeholder="메인 자습실"
              className="input-admin"
            />
            <FormError message={errors.title?.message} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">
              설명
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="공간에 대한 설명을 입력하세요."
              className="input-admin resize-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted">
              배경 이미지
            </label>
            <ImageUploader
              bucket="space-images"
              folder="slides"
              maxFiles={1}
              maxSizeMB={5}
              value={imageUrls}
              onChange={setImageUrls}
            />
            <p className="mt-1 text-xs text-muted">
              이미지가 없으면 기본 그라디언트가 표시됩니다.
            </p>
          </div>
        </div>

        <div className="border border-rule bg-white p-6 space-y-4">
          <h3 className="font-medium text-ink">설정</h3>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              {...register("is_active")}
              className="h-4 w-4 border-rule"
            />
            <label htmlFor="is_active" className="text-sm text-ink cursor-pointer">
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
              className="input-admin w-32"
            />
            <p className="mt-1 text-xs text-muted">
              숫자가 작을수록 먼저 표시됩니다.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
