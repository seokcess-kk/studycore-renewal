"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Nav, Footer, Button, useToast, ImageUploader, FormError } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { createReview } from "@/domains/review/service";
import { z } from "zod";
import {
  type ReviewCategoryValue,
  CATEGORY_LABELS,
} from "@/domains/review/model";
import { useUserStore } from "@/stores/useUserStore";
import { Star, ArrowLeft } from "lucide-react";

// RHF 호환 스키마 (default 없이 명시적 타입)
const reviewFormSchema = z.object({
  category: z.enum(["student", "parent", "alumni"]),
  rating: z.number().min(1).max(5),
  content: z.string().min(10, "10자 이상 작성해주세요").max(1000),
  images: z.array(z.string()),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export default function WriteReviewPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isActive } = useUserStore();

  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      category: "student",
      rating: 5,
      content: "",
      images: [],
    },
  });

  const category = watch("category");
  const rating = watch("rating");
  const content = watch("content");
  const images = watch("images") || [];

  // 활성 재원생이 아니면 리다이렉트
  if (!isActive) {
    return (
      <>
        <Nav />
        <main className="page-body bg-stone">
          <div className="max-w-lg mx-auto px-6 py-12 text-center">
            <p className="text-muted text-reading mb-4">
              활성 상태의 재원생만 후기를 작성할 수 있습니다.
            </p>
            <Button variant="secondary" onClick={() => router.push("/reviews")}>
              후기 목록으로
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const onSubmit = async (data: ReviewFormValues) => {
    const supabase = createClient();
    const result = await createReview(supabase, data);

    if (result.success) {
      showToast("후기가 등록되었습니다.", "success");
      router.push("/reviews");
    } else {
      showToast(result.error || "후기 등록에 실패했습니다.", "error");
    }
  };

  return (
    <>
      <Nav />
      <main className="page-body bg-stone">
        <div className="max-w-lg mx-auto px-6">
          {/* 헤더 */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white border border-transparent hover:border-rule transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft size={18} className="text-muted" />
            </button>
            <h1 className="font-serif text-fluid-h2 font-bold text-ink">후기 작성</h1>
          </div>

          {/* 폼 */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-rule p-6">
            {/* 카테고리 */}
            <div className="mb-6">
              <label className="block text-secondary font-medium text-ink mb-2">
                작성자 유형
              </label>
              <div className="flex gap-2">
                {(["student", "parent", "alumni"] as ReviewCategoryValue[]).map(
                  (cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setValue("category", cat, { shouldValidate: true })}
                      className={`flex-1 py-2 text-secondary font-medium border transition-colors cursor-pointer ${
                        category === cat
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-muted border-rule hover:border-navy"
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  )
                )}
              </div>
              <FormError message={errors.category?.message} />
            </div>

            {/* 별점 */}
            <div className="mb-6">
              <label className="block text-secondary font-medium text-ink mb-2">
                만족도
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue("rating", star, { shouldValidate: true })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      size={32}
                      className={
                        star <= (hoverRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-rule"
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 text-body text-muted self-center">
                  {rating}점
                </span>
              </div>
              <FormError message={errors.rating?.message} />
            </div>

            {/* 내용 */}
            <div className="mb-6">
              <label className="block text-secondary font-medium text-ink mb-2">
                후기 내용
              </label>
              <textarea
                {...register("content")}
                placeholder="스터디코어에서의 경험을 자유롭게 작성해주세요."
                rows={8}
                maxLength={1000}
                className="input-base resize-none"
              />
              <div className="flex justify-between mt-1">
                <span className={`text-caption ${errors.content ? "text-red-500" : "text-muted"}`}>
                  {errors.content?.message || "최소 10자 이상 작성해주세요."}
                </span>
                <span className="text-caption text-muted">
                  {content.length} / 1000
                </span>
              </div>
            </div>

            {/* 이미지 업로드 */}
            <div className="mb-6">
              <label className="block text-secondary font-medium text-ink mb-2">
                사진 첨부 (선택)
              </label>
              <ImageUploader
                bucket="review-images"
                folder={user?.id || ""}
                maxFiles={3}
                maxSizeMB={1}
                value={images}
                onChange={(urls) => setValue("images", urls)}
                disabled={isSubmitting}
              />
            </div>

            {/* 제출 */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              후기 등록
            </Button>
          </form>

          {/* 안내 */}
          <div className="mt-4 p-4 bg-stone border border-rule">
            <p className="text-small text-muted">
              • 작성된 후기는 관리자 확인 후 공개됩니다.
              <br />
              • 부적절한 내용은 삭제될 수 있습니다.
              <br />
              • 이미지는 최대 3장까지 첨부 가능합니다.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
