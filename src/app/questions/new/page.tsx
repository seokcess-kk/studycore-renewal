"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Nav, Footer, Button, ImageUploader, useToast } from "@/components/common";
import { createClient } from "@/lib/supabase/client";
import { createQuestion } from "@/domains/question/service";
import { createQuestionSchema, type CreateQuestionInput } from "@/domains/question/model";
import { useUserStore } from "@/stores/useUserStore";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft, Send, Clock, Globe } from "lucide-react";
import Link from "next/link";

export default function NewQuestionPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isActive, isAuthenticated } = useUserStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateQuestionInput>({
    resolver: zodResolver(createQuestionSchema),
  });

  const onSubmit = async (data: CreateQuestionInput) => {
    if (!isAuthenticated || !isActive) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const result = await createQuestion(supabase, {
        ...data,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
        is_public: data.is_public ?? false,
      });

      if (result.success) {
        showToast("질문이 등록되었습니다.", "success");
        router.push(ROUTES.QUESTIONS);
      } else {
        showToast(result.error || "질문 등록에 실패했습니다.", "error");
      }
    } catch {
      showToast("질문 등록 중 오류가 발생했습니다.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 비활성 사용자 안내
  if (!isActive && isAuthenticated) {
    return (
      <>
        <Nav />
        <main className="page-body min-h-screen bg-stone">
          <div className="max-w-md mx-auto px-6 py-16 text-center">
            <div className="w-16 h-16 bg-navy/10 flex items-center justify-center mx-auto mb-6">
              <Clock size={32} className="text-navy" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-ink mb-4">
              승인 대기 중
            </h1>
            <p className="text-muted text-reading leading-relaxed">
              질문방은 관리자 승인 후 이용 가능합니다.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="page-body min-h-screen bg-stone">
        {/* 헤더 */}
        <section className="bg-navy py-12 px-6 md:px-13">
          <div className="container-wide">
            <Link
              href={ROUTES.QUESTIONS}
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-secondary mb-4 transition-colors"
            >
              <ArrowLeft size={14} />
              질문 목록으로
            </Link>
            <h1 className="font-serif text-[clamp(24px,4vw,36px)] font-bold text-white">
              새 질문 작성
            </h1>
          </div>
        </section>

        {/* 폼 */}
        <section className="px-6 md:px-13 py-8">
          <div className="max-w-2xl mx-auto bg-white border border-rule p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 제목 */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-secondary font-medium text-ink mb-2"
                >
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="질문 제목을 입력하세요"
                  className={`w-full px-4 py-3 border bg-white text-reading focus:outline-none focus:border-navy ${
                    errors.title ? "border-red-500" : "border-rule"
                  }`}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="mt-1 text-small text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* 내용 */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-secondary font-medium text-ink mb-2"
                >
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="content"
                  rows={8}
                  placeholder="질문 내용을 상세히 작성해주세요. 문제 번호, 교재명 등을 포함하면 더 정확한 답변을 받을 수 있습니다."
                  className={`w-full px-4 py-3 border bg-white text-reading resize-none focus:outline-none focus:border-navy ${
                    errors.content ? "border-red-500" : "border-rule"
                  }`}
                  {...register("content")}
                />
                {errors.content && (
                  <p className="mt-1 text-small text-red-500">
                    {errors.content.message}
                  </p>
                )}
              </div>

              {/* 이미지 첨부 */}
              <div>
                <label className="block text-secondary font-medium text-ink mb-2">
                  이미지 첨부 (선택)
                </label>
                <p className="text-small text-muted mb-3">
                  문제 사진이나 풀이 과정을 첨부하면 더 정확한 답변을 받을 수 있습니다.
                </p>
                <ImageUploader
                  bucket="question-images"
                  folder={user?.id || "anonymous"}
                  maxFiles={5}
                  maxSizeMB={1}
                  value={imageUrls}
                  onChange={setImageUrls}
                />
              </div>

              {/* 공개 설정 */}
              <div className="bg-stone p-4 border border-rule">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-4 h-4 border-rule accent-teal"
                    {...register("is_public")}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-teal" />
                      <span className="text-body font-medium text-ink">
                        다른 학생에게 공개
                      </span>
                    </div>
                    <p className="text-small text-muted mt-1">
                      공개하면 다른 재원생들도 질문과 답변을 볼 수 있습니다.
                    </p>
                  </div>
                </label>
              </div>

              {/* 안내 */}
              <div className="bg-stone p-4 border border-rule">
                <h3 className="text-secondary font-medium text-ink mb-2">
                  질문 작성 안내
                </h3>
                <ul className="text-small text-muted space-y-1">
                  <li>• 질문은 멘토에게 알림이 발송됩니다.</li>
                  <li>• 답변이 등록되면 알림을 받을 수 있습니다.</li>
                  <li>• 답변이 달린 질문은 수정/삭제가 불가합니다.</li>
                </ul>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <Link href={ROUTES.QUESTIONS} className="flex-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                  >
                    취소
                  </Button>
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "등록 중..."
                  ) : (
                    <>
                      <Send size={16} />
                      질문 등록
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
